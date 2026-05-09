import "./globals.css";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";
import SocketChatInbox from "@/components/SocketChatInbox";
import { NotificationProvider } from "@/context/NotificationContext";
import { RealtimeProvider } from "@/context/RealtimeContext";

export const metadata = {
  title: "CampusMart — Student Marketplace",
  description: "Buy, sell, and rent within your campus community",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="min-h-screen bg-slate-50">
        <NotificationProvider>
          <RealtimeProvider>

            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>

            {/* Chatbot */}
            <ChatWidget />
            <SocketChatInbox />

          </RealtimeProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
