import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Hall {
  id: string;
  name: string;
  capacity: number;
  location: string;
  hourly_rate: number;
  amenities: string[];
  availability: 'available' | 'booked' | 'maintenance';
  venue_type: 'hall' | 'lounge';
  created_at: string;
  updated_at: string;
}

export interface HallBooking {
  id: string;
  hall_id: string;
  event_name: string;
  organizer_name: string;
  guest_id?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  number_of_guests?: number;
  total_amount: number;
  amount_paid: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  payment_method?: string;
  payment_history: Array<{
    amount: number;
    date: string;
    method: string;
    reference?: string;
  }>;
  status: 'confirmed' | 'pending' | 'cancelled';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export const useHallsDB = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [bookings, setBookings] = useState<HallBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHalls = async () => {
    const { data, error } = await supabase
      .from("halls")
      .select("*")
      .order("name");

    if (error) {
      toast({
        title: "Error fetching halls",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setHalls(data as Hall[] || []);
  };

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("hall_bookings")
      .select("*")
      .order("booking_date", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching bookings",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setBookings(data as HallBooking[] || []);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchHalls(), fetchBookings()]);
      setLoading(false);
    };

    loadData();

    // Real-time subscriptions
    const hallsChannel = supabase
      .channel("halls_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "halls" }, fetchHalls)
      .subscribe();

    const bookingsChannel = supabase
      .channel("hall_bookings_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "hall_bookings" }, fetchBookings)
      .subscribe();

    return () => {
      supabase.removeChannel(hallsChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, []);

  const addHall = async (hallData: Omit<Hall, "id" | "created_at" | "updated_at">) => {
    const { error } = await supabase.from("halls").insert([hallData]);

    if (error) {
      toast({
        title: "Error adding venue",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({ title: `${hallData.venue_type === 'hall' ? 'Hall' : 'Lounge'} added successfully` });
  };

  const updateHall = async (id: string, hallData: Partial<Hall>) => {
    const { error } = await supabase
      .from("halls")
      .update(hallData)
      .eq("id", id);

    if (error) {
      toast({
        title: "Error updating venue",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({ title: "Venue updated successfully" });
  };

  const createBooking = async (bookingData: Omit<HallBooking, "id" | "created_at" | "updated_at" | "amount_paid" | "payment_history">) => {
    const { data, error } = await supabase.from("hall_bookings").insert([{
      ...bookingData,
      amount_paid: 0,
      payment_history: []
    }]).select().single();

    if (error) {
      toast({
        title: "Error creating booking",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    // Update hall availability
    await updateHall(bookingData.hall_id, { availability: 'booked' });

    // If confirmed, create accounting entry
    if (data && bookingData.status === 'confirmed' && bookingData.payment_status === 'paid') {
      const { createAccountingEntryForPayment } = await import('@/utils/accountingIntegration');
      const hall = halls.find(h => h.id === bookingData.hall_id);
      
      await createAccountingEntryForPayment({
        amount: bookingData.total_amount,
        description: `${hall?.venue_type === 'lounge' ? 'Lounge' : 'Hall'} booking payment - ${bookingData.event_name} at ${hall?.name || 'Venue'}`,
        source_type: 'hall_booking',
        source_id: data.id,
        reference_number: `HB-${data.id.slice(0, 8)}`,
        payment_method: bookingData.payment_method || 'bank',
        guest_name: bookingData.organizer_name,
      });
    }

    toast({ title: "Booking created successfully" });
    return data;
  };

  const addPayment = async (bookingId: string, paymentAmount: number, paymentMethod: string, reference?: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      toast({
        title: "Error",
        description: "Booking not found",
        variant: "destructive",
      });
      return;
    }

    const newAmountPaid = booking.amount_paid + paymentAmount;
    const paymentHistory = [
      ...booking.payment_history,
      {
        amount: paymentAmount,
        date: new Date().toISOString(),
        method: paymentMethod,
        reference
      }
    ];

    let newPaymentStatus: 'pending' | 'partial' | 'paid' = 'pending';
    if (newAmountPaid >= booking.total_amount) {
      newPaymentStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newPaymentStatus = 'partial';
    }

    const { error } = await supabase
      .from("hall_bookings")
      .update({
        amount_paid: newAmountPaid,
        payment_status: newPaymentStatus,
        payment_history: paymentHistory,
        payment_method: paymentMethod
      })
      .eq("id", bookingId);

    if (error) {
      toast({
        title: "Error processing payment",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    // Create accounting entry for this payment
    if (newPaymentStatus === 'paid' || newPaymentStatus === 'partial') {
      const { createAccountingEntryForPayment } = await import('@/utils/accountingIntegration');
      const hall = halls.find(h => h.id === booking.hall_id);
      
      await createAccountingEntryForPayment({
        amount: paymentAmount,
        description: `${newPaymentStatus === 'paid' ? 'Full' : 'Partial'} payment for ${hall?.venue_type === 'lounge' ? 'Lounge' : 'Hall'} booking - ${booking.event_name}`,
        source_type: 'hall_booking',
        source_id: bookingId,
        reference_number: reference || `HB-${bookingId.slice(0, 8)}-${paymentHistory.length}`,
        payment_method: paymentMethod,
        guest_name: booking.organizer_name,
      });
    }

    toast({ 
      title: "Payment recorded", 
      description: `${paymentAmount.toLocaleString()} paid. ${newPaymentStatus === 'paid' ? 'Fully paid!' : `Balance: ${(booking.total_amount - newAmountPaid).toLocaleString()}`}` 
    });
  };

  const updateBooking = async (id: string, bookingData: Partial<HallBooking>) => {
    const { error } = await supabase
      .from("hall_bookings")
      .update(bookingData)
      .eq("id", id);

    if (error) {
      toast({
        title: "Error updating booking",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({ title: "Booking updated successfully" });
  };

  const cancelBooking = async (id: string) => {
    const booking = bookings.find(b => b.id === id);
    
    const { error } = await supabase
      .from("hall_bookings")
      .update({ status: 'cancelled' })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error cancelling booking",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    // Update hall availability if this was the only booking
    if (booking) {
      const otherActiveBookings = bookings.filter(
        b => b.hall_id === booking.hall_id && b.id !== id && b.status !== 'cancelled'
      );
      
      if (otherActiveBookings.length === 0) {
        await updateHall(booking.hall_id, { availability: 'available' });
      }
    }

    toast({ title: "Booking cancelled successfully" });
  };

  const getAvailableHalls = (venueType?: 'hall' | 'lounge') => {
    let filtered = halls.filter(h => h.availability === 'available');
    if (venueType) {
      filtered = filtered.filter(h => h.venue_type === venueType);
    }
    return filtered;
  };

  const getHallsByType = (venueType: 'hall' | 'lounge') => {
    return halls.filter(h => h.venue_type === venueType);
  };

  return {
    halls,
    bookings,
    loading,
    addHall,
    updateHall,
    createBooking,
    addPayment,
    updateBooking,
    cancelBooking,
    getAvailableHalls,
    getHallsByType,
  };
};
