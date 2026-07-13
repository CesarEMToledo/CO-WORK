import { Phone, Mail } from "lucide-react";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-outline/10 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-on-surface-variant">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <a href="tel:+524811119463" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Phone size={14} />
              481 111 9463
            </a>
            <a href="mailto:coworkvalles@gmail.com" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Mail size={14} />
              coworkvalles@gmail.com
            </a>
            <a
              href="https://instagram.com/coworkciudadvalles"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <InstagramIcon size={14} />
              @coworkciudadvalles
            </a>
            <a
              href="https://facebook.com/coworkciudadvalles"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <FacebookIcon size={14} />
              coworkciudadvalles
            </a>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-on-surface-variant pt-4 border-t border-outline/10">
          <span>© 2026 CO-WORK · Ciudad Valles, S.L.P. · Huasteca Potosina</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Términos</a>
            <a href="#" className="hover:text-primary transition-colors">Soporte</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
