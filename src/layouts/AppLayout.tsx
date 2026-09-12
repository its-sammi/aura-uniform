import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { APP_INFO } from '../data/content';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[var(--section)] text-[var(--color-charcoal)]">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <a
        href={APP_INFO.aura.whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with AURA UNIFORM on WhatsApp"
        className="floating-whatsapp"
      >
        <img src="/whatsapp.svg" alt="" className="whatsapp-mark whatsapp-mark-floating" />
      </a>
    </div>
  );
}
