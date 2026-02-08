import "./globals.css";

export const metadata = {
  title: "Trader Journal",
  description: "Dagbok + P/L kalender"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
