import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css'; // Ensure to import your global styles
import Header from '@/components/common/Header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastContainer />
        <Header />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
