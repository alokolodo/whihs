import { useState } from "react";

export interface Room {
  id: string;
  number: string;
  type: "Standard Single" | "Standard Double" | "King Size" | "Queen Size" | "Twin Beds" | "Suite" | "Deluxe Single" | "Deluxe Double" | "Presidential Suite" | "Executive Room";
  status: "ready" | "occupied" | "vacant-dirty" | "under-repairs";
  guest?: string;
  checkIn?: string;
  checkOut?: string;
  rate: number;
  amenities: string[];
  floor: number;
  bedType: string;
  roomSize: number;
  bookedDays?: number; // New field for tracking booking days
}

export const useRooms = () => {
  const [rooms] = useState<Room[]>([
    { 
      id: "1", 
      number: "101", 
      type: "King Size", 
      status: "occupied",
      guest: "John Smith", 
      checkIn: "2024-01-15", 
      checkOut: "2024-01-17", 
      rate: 150, 
      amenities: ["WiFi", "Air Condition", "Television", "Reading Table & Chair", "Fan", "Solar Power"], 
      floor: 1,
      bedType: "King Size Bed",
      roomSize: 35,
      bookedDays: 2
    },
    { 
      id: "2", 
      number: "102", 
      type: "Queen Size", 
      status: "ready",
      rate: 130, 
      amenities: ["WiFi", "Air Condition", "Television", "Reading Table & Chair", "Mini Bar", "Solar Power"], 
      floor: 1,
      bedType: "Queen Size Bed",
      roomSize: 32
    },
    { 
      id: "3", 
      number: "103", 
      type: "Presidential Suite", 
      status: "vacant-dirty", 
      rate: 450, 
      amenities: ["WiFi", "Air Condition", "Television", "Reading Table & Chair", "Fan", "Solar Power", "Balcony", "Kitchen", "Living Room"], 
      floor: 1,
      bedType: "King Size Bed + Sofa Bed",
      roomSize: 85
    },
    { 
      id: "4", 
      number: "201", 
      type: "Twin Beds", 
      status: "occupied", 
      guest: "Sarah Johnson", 
      checkIn: "2024-01-14", 
      checkOut: "2024-01-16", 
      rate: 140, 
      amenities: ["WiFi", "Air Condition", "Television", "Reading Table & Chair", "Fan", "Solar Power"], 
      floor: 2,
      bedType: "Two Single Beds",
      roomSize: 38,
      bookedDays: 2
    },
    { 
      id: "5", 
      number: "202", 
      type: "Executive Room", 
      status: "ready",
      rate: 280, 
      amenities: ["WiFi", "Air Condition", "Television", "Reading Table & Chair", "Fan", "Solar Power", "Work Desk", "Coffee Machine"], 
      floor: 2,
      bedType: "King Size Bed",
      roomSize: 45
    },
    { 
      id: "6", 
      number: "203", 
      type: "Standard Double", 
      status: "under-repairs", 
      rate: 110, 
      amenities: ["WiFi", "Air Condition", "Television", "Reading Table & Chair", "Fan", "Solar Power"], 
      floor: 2,
      bedType: "Double Bed",
      roomSize: 28
    },
    { 
      id: "7", 
      number: "301", 
      type: "Suite", 
      status: "ready",
      rate: 320, 
      amenities: ["WiFi", "Air Condition", "Television", "Reading Table & Chair", "Fan", "Solar Power", "Balcony", "Kitchenette"], 
      floor: 3,
      bedType: "King Size Bed",
      roomSize: 55
    },
    { 
      id: "8", 
      number: "302", 
      type: "Deluxe Double", 
      status: "ready", 
      rate: 180, 
      amenities: ["WiFi", "Air Condition", "Television", "Reading Table & Chair", "Fan", "Solar Power", "Mini Fridge"], 
      floor: 3,
      bedType: "Double Bed",
      roomSize: 40
    },
  ]);

  const getAvailableRooms = () => {
    return rooms.filter(room => room.status === "ready");
  };

  const getOccupiedRooms = () => {
    return rooms.filter(room => room.status === "occupied");
  };

  return {
    rooms,
    getAvailableRooms,
    getOccupiedRooms
  };
};