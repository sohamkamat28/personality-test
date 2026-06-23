import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export const metadata = {
  metadataBase: new URL("https://tealogyneo-hiranandani.in"),
  title: {
    default: "TEALOGY NEO — Third Place Brew | Hiranandani Meadows, Thane",
    template: "%s | TEALOGY NEO"
  },
  description:
    "Thane's cosiest chai café at Hiranandani Meadows. Premium Kulhad Chai, 150+ menu items, pocket-friendly prices. Your Third Place — open daily 9 AM to 11:30 PM.",
  openGraph: {
    title: "TEALOGY NEO Third Place Brew — Hiranandani Meadows",
    description:
      "Premium chai café at Emerald Plaza, Hiranandani Meadows, Thane. Kulhad chai, cold coffee, bites. Walk in. Belong.",
    images: ["/og-image-tealogy.jpg"]
  },
  alternates: {
    canonical: "/"
  },
  other: {
    "geo.region": "IN-MH",
    "geo.placename": "Thane, Maharashtra"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
