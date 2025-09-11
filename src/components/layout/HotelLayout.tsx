import { ReactNode } from "react";
import { HotelSidebar } from "./HotelSidebar";
import { Header } from "./Header";

interface HotelLayoutProps {
  children: ReactNode;
}

export const HotelLayout = ({ children }: HotelLayoutProps) => {
  return (
    <>
      <HotelSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </>
  );
};