import Header from "@/components/Header";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

export const metadata = {
  title: "Welth",
  description: "One stop finance platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body>
        {/* Header */}
        <Header/>
        <main className="min-h-screen">{children}</main>
        <Toaster richColors/>
        {/* Footer */}
        <footer className="bg-blue-100 py-12">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>Made with ❤️ from Ankit Sangode</p>
          </div>
        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
