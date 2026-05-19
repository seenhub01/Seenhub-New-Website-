
import "./globals.css";
import "./layout.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata = {
  title: 'SEEN Business Hub | Al Ain\'s First AI-Powered Workspace',
  description: 'Book coworking spaces, private offices, and meeting rooms in Al Ain. SeenHub offers AI-powered business services, flexible memberships, and a vibrant community.',
  keywords: 'coworking Al Ain, business hub, office space rental, meeting rooms Al Ain, SeenHub',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'SEEN Business Hub | Al Ain',
    description: 'Modern AI-powered workspace in Al Ain.',
    url: 'https://seenhub.ae',
    siteName: 'SeenHub',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_AE',
    type: 'website',
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
