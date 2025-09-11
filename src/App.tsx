import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HotelLayout } from "./components/layout/HotelLayout";
import Index from "./pages/Index";
import BookingPage from "./pages/BookingPage";
import POSSystem from "./pages/POSSystem";
import AdminDashboard from "./pages/AdminDashboard";
import Settings from "./pages/Settings";
import RecipeManagement from "./pages/RecipeManagement";
import MenuManagement from "./pages/MenuManagement";
import RoomManagement from "./pages/RoomManagement";
import HallManagement from "./pages/HallManagement";
import GymManagement from "./pages/GymManagement";
import GameCenter from "./pages/GameCenter";
import BookingConfirmation from "./pages/BookingConfirmation";
import BookingManagement from "./pages/BookingManagement";
import GuestManagement from "./pages/GuestManagement";
import PaymentsManagement from "./pages/PaymentsManagement";
import InventoryManagement from "./pages/InventoryManagement";
import AccountingModule from "./pages/AccountingModule";
import HRManagement from "./pages/HRManagement";
import HousekeepingManagement from "./pages/HousekeepingManagement";
import RestaurantPOS from "./components/pos/RestaurantPOS";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/book" element={<BookingPage />} />
                
                {/* Admin/Staff routes with sidebar layout */}
                <Route path="/pos" element={
                  <HotelLayout>
                    <POSSystem />
                  </HotelLayout>
                } />
                <Route path="/pos/restaurant" element={
                  <HotelLayout>
                    <RestaurantPOS />
                  </HotelLayout>
                } />
                <Route path="/admin" element={
                  <HotelLayout>
                    <AdminDashboard />
                  </HotelLayout>
                } />
                <Route path="/admin/settings" element={
                  <HotelLayout>
                    <Settings />
                  </HotelLayout>
                } />
                <Route path="/admin/recipes" element={
                  <HotelLayout>
                    <RecipeManagement />
                  </HotelLayout>
                } />
                <Route path="/admin/menu" element={
                  <HotelLayout>
                    <MenuManagement />
                  </HotelLayout>
                } />
                <Route path="/admin/rooms" element={
                  <HotelLayout>
                    <RoomManagement />
                  </HotelLayout>
                } />
                <Route path="/admin/halls" element={
                  <HotelLayout>
                    <HallManagement />
                  </HotelLayout>
                } />
                <Route path="/admin/bookings" element={
                  <HotelLayout>
                    <BookingManagement />
                  </HotelLayout>
                } />
                <Route path="/admin/gym" element={
                  <HotelLayout>
                    <GymManagement />
                  </HotelLayout>
                } />
                <Route path="/admin/game-center" element={
                  <HotelLayout>
                    <GameCenter />
                  </HotelLayout>
                } />
                <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                <Route path="/admin/guests" element={
                  <HotelLayout>
                    <GuestManagement />
                  </HotelLayout>
                } />
                <Route path="/admin/payments" element={
                  <HotelLayout>
                    <PaymentsManagement />
                  </HotelLayout>
                } />
                <Route path="/admin/inventory" element={
                  <HotelLayout>
                    <InventoryManagement />
                  </HotelLayout>
                } />
                <Route path="/admin/accounting" element={
                  <HotelLayout>
                    <AccountingModule />
                  </HotelLayout>
                } />
                <Route path="/admin/hr" element={
                  <HotelLayout>
                    <HRManagement />
                  </HotelLayout>
                } />
                <Route path="/admin/housekeeping" element={
                  <HotelLayout>
                    <HousekeepingManagement />
                  </HotelLayout>
                } />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;