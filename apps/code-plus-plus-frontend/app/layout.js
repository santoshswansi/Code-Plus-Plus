import "./globals.css";
import 'primereact/resources/themes/mdc-light-indigo/theme.css'
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { PrimeReactProvider } from 'primereact/api';
import { Toaster } from "@/components/ui/sonner"
import ClientWrapper from "@/components/ClientWrapper";
import localFont from 'next/font/local';

const spaceGrotesk = localFont({
  src: [
    { path: './fonts/SpaceGrotesk-Regular.ttf', weight: '400' },
    { path: './fonts/SpaceGrotesk-Medium.ttf', weight: '500' },
    { path: './fonts/SpaceGrotesk-SemiBold.ttf', weight: '600' },
    { path: './fonts/SpaceGrotesk-Bold.ttf', weight: '700' },
  ],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata = {
  title: "Code++",
  description: "A Realtime Code Editor",
};

export default function RootLayout({ children }) {
  return (
      <PrimeReactProvider>
        <html lang="en" className={`${spaceGrotesk.variable}`}>
          <body>
            <ClientWrapper>
              {children}
              <Toaster 
                position="top-right"
              />
            </ClientWrapper>
          </body>
        </html>
      </PrimeReactProvider>
  );
}
