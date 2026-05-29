import Header from "./components/Header";
import Footer from "./components/Footer";
import { SearchProvider } from "./components/searchContext";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <SearchProvider>
          <Header />
          {children}
          <Footer />
        </SearchProvider>
      </body>
    </html>
  );
}
