import "./globals.css";

export const metadata = {
  title: "Invoice Generator",
  description: "Create invoices with a live preview and export them as PDF.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
