import type { Metadata } from "next";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";
import { CartProvider } from "@/context/CartContext";
import { CropProvider } from "@/context/CropContext";
import { ToastProvider } from "@/components/ui/Toast";
import { Header } from "@/components/marketplace/Header";
import { Footer } from "@/components/marketplace/Footer";
import { CartDrawer } from "@/components/marketplace/CartDrawer";
import { RoleModal } from "@/components/marketplace/RoleModal";

export const metadata: Metadata = {
  title: "Kisan Vyapar Portal | Direct Farm-to-Buyer Marketplace",
  description: "Connecting Indian Farmers Directly to Wholesale & Retail Buyers. Verified crops, transparent mandi pricing, live harvest alerts, and secure COD / Razorpay transactions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-[#FAFCFA] text-[#1E2A22] flex flex-col font-sans selection:bg-[#6FBF78]/30 selection:text-[#1E2A22]">
        <RoleProvider>
          <CropProvider>
            <CartProvider>
              <ToastProvider>
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
                <CartDrawer />
                <RoleModal />
              </ToastProvider>
            </CartProvider>
          </CropProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
