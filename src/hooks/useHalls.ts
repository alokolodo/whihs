import { useState } from "react";

export interface Hall {
  id: string;
  name: string;
  capacity: number;
  location: string;
  rate: number;
  rate_type: 'hourly' | 'daily';
  amenities: string[];
  availability: "available" | "booked" | "maintenance";
  bookedDays?: number; // New field for tracking booking days
}

export interface HallBooking {
  id: string;
  hallId: string;
  hallName: string;
  event: string;
  organizer: string;
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
  status: "confirmed" | "pending" | "cancelled";
  totalAmount: number;
}

export const useHalls = () => {
  const [halls] = useState<Hall[]>([
    {
      id: "1",
      name: "Grand Ballroom",
      capacity: 500,
      location: "Ground Floor",
      rate: 300,
      rate_type: 'hourly',
      amenities: ["Stage", "Sound System", "Lighting", "AC", "Catering Kitchen"],
      availability: "available"
    },
    {
      id: "2", 
      name: "Conference Hall A",
      capacity: 100,
      location: "First Floor",
      rate: 150,
      rate_type: 'hourly',
      amenities: ["Projector", "WiFi", "Whiteboard", "AC", "Coffee Station"],
      availability: "booked",
      bookedDays: 3
    },
    {
      id: "3",
      name: "Banquet Hall",
      capacity: 200,
      location: "Ground Floor", 
      rate: 200,
      rate_type: 'hourly',
      amenities: ["Dance Floor", "Bar Counter", "Kitchen Access", "Garden View"],
      availability: "available"
    },
    {
      id: "4",
      name: "Meeting Room B",
      capacity: 50,
      location: "Second Floor",
      rate: 80,
      rate_type: 'hourly',
      amenities: ["Video Conferencing", "WiFi", "Presentation Screen"],
      availability: "maintenance"
    }
  ]);

  const [bookings] = useState<HallBooking[]>([
    {
      id: "1",
      hallId: "1",
      hallName: "Grand Ballroom",
      event: "Wedding Reception",
      organizer: "Smith Family",
      date: "2024-01-20",
      startTime: "18:00",
      endTime: "23:00",
      guests: 350,
      status: "confirmed",
      totalAmount: 1500
    },
    {
      id: "2",
      hallId: "2", 
      hallName: "Conference Hall A",
      event: "Corporate Meeting",
      organizer: "Tech Corp Ltd",
      date: "2024-01-18",
      startTime: "09:00", 
      endTime: "17:00",
      guests: 80,
      status: "confirmed",
      totalAmount: 1200
    }
  ]);

  const getAvailableHalls = () => {
    return halls.filter(hall => hall.availability === "available");
  };

  const getBookedHalls = () => {
    return halls.filter(hall => hall.availability === "booked");
  };

  return {
    halls,
    bookings,
    getAvailableHalls,
    getBookedHalls
  };
};