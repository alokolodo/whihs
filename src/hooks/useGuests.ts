import { useState } from "react";

export interface RegisteredGuest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  nationality: string;
  joinDate: string;
  totalBookings: number;
  totalSpent: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  status: 'active' | 'vip' | 'blacklisted';
  lastStay: string;
  preferences: string[];
  notes: string;
}

export const useGuests = () => {
  const [guests] = useState<RegisteredGuest[]>([
    {
      id: "G001",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main St, New York, NY 10001",
      nationality: "USA",
      joinDate: "2023-01-15",
      totalBookings: 15,
      totalSpent: 12450,
      loyaltyTier: 'Gold',
      status: 'vip',
      lastStay: "2024-01-10",
      preferences: ["Non-smoking", "High floor", "City view"],
      notes: "Prefers late checkout, vegetarian meals"
    },
    {
      id: "G002",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1 (555) 234-5678",
      address: "456 Oak Ave, Los Angeles, CA 90210",
      nationality: "USA",
      joinDate: "2023-03-22",
      totalBookings: 8,
      totalSpent: 6780,
      loyaltyTier: 'Silver',
      status: 'active',
      lastStay: "2024-01-05",
      preferences: ["Ocean view", "King bed"],
      notes: "Business traveler, needs early check-in"
    },
    {
      id: "G003",
      name: "Michael Brown",
      email: "m.brown@email.com",
      phone: "+1 (555) 345-6789",
      address: "789 Pine Rd, Chicago, IL 60601",
      nationality: "Canada",
      joinDate: "2022-11-10",
      totalBookings: 22,
      totalSpent: 18990,
      loyaltyTier: 'Platinum',
      status: 'vip',
      lastStay: "2024-01-08",
      preferences: ["Spa access", "Pet-friendly"],
      notes: "Frequent guest, prefers suite upgrades"
    },
    {
      id: "G004",
      name: "Emily Davis",
      email: "emily.davis@email.com",
      phone: "+1 (555) 456-7890",
      address: "321 Elm St, Miami, FL 33101",
      nationality: "USA",
      joinDate: "2023-06-15",
      totalBookings: 5,
      totalSpent: 3250,
      loyaltyTier: 'Bronze',
      status: 'active',
      lastStay: "2023-12-20",
      preferences: ["Ground floor", "Gym access"],
      notes: "Young professional, budget-conscious"
    },
    {
      id: "G005",
      name: "David Wilson",
      email: "d.wilson@email.com",
      phone: "+1 (555) 567-8901",
      address: "654 Maple Dr, Seattle, WA 98101",
      nationality: "UK",
      joinDate: "2023-02-28",
      totalBookings: 12,
      totalSpent: 9870,
      loyaltyTier: 'Gold',
      status: 'active',
      lastStay: "2023-12-28",
      preferences: ["City view", "Business center"],
      notes: "International traveler, extended stays"
    }
  ]);

  const getAvailableGuests = () => {
    return guests.filter(guest => guest.status !== 'blacklisted');
  };

  const getGuestById = (id: string) => {
    return guests.find(guest => guest.id === id);
  };

  const getGuestByName = (name: string) => {
    return guests.find(guest => guest.name.toLowerCase() === name.toLowerCase());
  };

  return {
    guests,
    getAvailableGuests,
    getGuestById,
    getGuestByName
  };
};