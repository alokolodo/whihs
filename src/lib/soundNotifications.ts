// Sound notification utilities for inventory alerts
export type SoundType = 'critical' | 'warning' | 'info' | 'success';

interface SoundConfig {
  frequency: number[];
  duration: number;
  volume: number;
  pattern: 'single' | 'double' | 'triple' | 'rapid';
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  critical: {
    frequency: [800, 1200, 800, 1200],
    duration: 0.5,
    volume: 0.4,
    pattern: 'rapid'
  },
  warning: {
    frequency: [600, 800],
    duration: 0.3,
    volume: 0.3,
    pattern: 'double'
  },
  info: {
    frequency: [400],
    duration: 0.15,
    volume: 0.2,
    pattern: 'single'
  },
  success: {
    frequency: [400, 600, 800],
    duration: 0.4,
    volume: 0.25,
    pattern: 'triple'
  }
};

export class SoundNotificationManager {
  private static instance: SoundNotificationManager;
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 1.0;

  private constructor() {
    // Initialize on first user interaction
    this.initializeAudioContext();
  }

  public static getInstance(): SoundNotificationManager {
    if (!SoundNotificationManager.instance) {
      SoundNotificationManager.instance = new SoundNotificationManager();
    }
    return SoundNotificationManager.instance;
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Handle audio context suspension (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        // Will be resumed on first user interaction
        document.addEventListener('click', this.resumeAudioContext.bind(this), { once: true });
        document.addEventListener('keydown', this.resumeAudioContext.bind(this), { once: true });
      }
    } catch (error) {
      console.warn('Could not initialize audio context:', error);
      this.audioContext = null;
    }
  }

  private async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Could not resume audio context:', error);
      }
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public isAudioEnabled(): boolean {
    return this.isEnabled && this.audioContext !== null;
  }

  public async playNotification(type: SoundType): Promise<void> {
    if (!this.isAudioEnabled() || !this.audioContext) {
      return;
    }

    try {
      await this.resumeAudioContext();
      
      const config = SOUND_CONFIGS[type];
      const startTime = this.audioContext.currentTime;
      
      switch (config.pattern) {
        case 'single':
          this.createTone(config.frequency[0], startTime, config.duration, config.volume);
          break;
          
        case 'double':
          this.createTone(config.frequency[0], startTime, config.duration / 2, config.volume);
          this.createTone(config.frequency[1] || config.frequency[0], startTime + config.duration / 2 + 0.05, config.duration / 2, config.volume);
          break;
          
        case 'triple':
          const segmentDuration = config.duration / 3;
          config.frequency.forEach((freq, index) => {
            this.createTone(freq, startTime + index * (segmentDuration + 0.02), segmentDuration, config.volume);
          });
          break;
          
        case 'rapid':
          const rapidSegment = config.duration / config.frequency.length;
          config.frequency.forEach((freq, index) => {
            this.createTone(freq, startTime + index * rapidSegment, rapidSegment * 0.8, config.volume);
          });
          break;
      }
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }

  private createTone(frequency: number, startTime: number, duration: number, baseVolume: number): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, startTime);
    
    const finalVolume = baseVolume * this.volume;
    gainNode.gain.setValueAtTime(finalVolume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  // Predefined notification methods for common use cases
  public playInventoryCritical() {
    this.playNotification('critical');
  }

  public playInventoryWarning() {
    this.playNotification('warning');
  }

  public playStockRestocked() {
    this.playNotification('success');
  }

  public playGeneralInfo() {
    this.playNotification('info');
  }

  // Play notification with delay (for sequences)
  public async playSequence(types: SoundType[], delayBetween: number = 500): Promise<void> {
    for (let i = 0; i < types.length; i++) {
      await this.playNotification(types[i]);
      if (i < types.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetween));
      }
    }
  }
}

// Convenience functions for common use cases
export const soundNotifications = SoundNotificationManager.getInstance();

export const playInventoryAlert = (severity: 'critical' | 'warning') => {
  if (severity === 'critical') {
    soundNotifications.playInventoryCritical();
  } else {
    soundNotifications.playInventoryWarning();
  }
};

export const playSuccessSound = () => {
  soundNotifications.playStockRestocked();
};

export const configureSounds = (enabled: boolean, volume: number = 1.0) => {
  soundNotifications.setEnabled(enabled);
  soundNotifications.setVolume(volume);
};