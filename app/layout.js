import "./globals.css";

export const metadata = {
  title: {
    default: "Personality test",
    template: "%s | Personality test"
  },
  description:
    "A private, mobile-first personality assessment portal with admin-managed access and one-time student submissions."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
