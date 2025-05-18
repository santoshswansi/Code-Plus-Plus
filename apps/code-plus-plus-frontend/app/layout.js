import "./globals.css";
import 'primereact/resources/themes/mdc-light-indigo/theme.css'
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { PrimeReactProvider } from 'primereact/api';
import { Toaster } from "@/components/ui/sonner"
import ClientWrapper from "@/components/ClientWrapper";

export const metadata = {
  title: "Code++",
  description: "A Realtime Code Editor",
};

export default function RootLayout({ children }) {
  return (
      <PrimeReactProvider>
        <html lang="en">
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
