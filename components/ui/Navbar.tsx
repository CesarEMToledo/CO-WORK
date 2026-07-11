import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-outline/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-icons text-white text-lg">nature_people</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-on-surface uppercase">CO-WORK</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#" className="text-primary font-bold text-sm border-b-2 border-primary px-1 py-1">Inicio</Link>
            <Link href="#" className="text-on-surface-variant hover:text-primary font-semibold text-sm px-1 py-1 transition-all">Compra</Link>
            <Link href="#" className="text-on-surface-variant hover:text-primary font-semibold text-sm px-1 py-1 transition-all">Renta</Link>
            <Link href="#" className="text-on-surface-variant hover:text-primary font-semibold text-sm px-1 py-1 transition-all">Favoritos</Link>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm py-2">
                <span className="material-symbols-outlined text-xl">language</span>
                <span className="text-sm">ES</span>
                <span className="material-symbols-outlined text-lg">expand_more</span>
              </button>
              <div className="absolute top-full right-0 mt-1 w-24 bg-white rounded-lg shadow-soft border border-outline/10 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link href="#" className="flex items-center justify-between px-4 py-2 text-xs font-bold text-primary bg-primary/5">
                  <span>ES</span>
                  <span className="material-symbols-outlined text-sm">check</span>
                </Link>
                <Link href="#" className="block px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-primary hover:bg-primary/5">EN</Link>
              </div>
            </div>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-icons">search</span>
            </button>
            <button className="text-on-surface-variant hover:text-primary transition-colors relative">
              <span className="material-icons">notifications_none</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
            </button>
            <button className="flex items-center gap-2 pl-2 border-l border-outline/20 ml-2">
              <div className="w-9 h-9 rounded-full bg-sahara-dim overflow-hidden ring-2 ring-transparent hover:ring-primary transition-all">
                <img alt="Perfil" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAWhQZ663Bd08kmzjbOPmUk4UIxYooNONShMEFXLR-DtmVi6Oz-TiaY77SPwFk7g0OobkeZEOMvt6v29mSOD0Xm2g95WbBG3ZjWXmiABOUwGU0LOySRfVDo-JTXQ0-gtwjWxbmue0qDm91m-zEOEZwAW6iRFB1qC1bAU-wkjxm67Sbztq8w7srHkFT9bVEC86qG-FzhOBTomhAurNRmx9l8Yfqabk328NfdKuVLckgCdaPsNFE3yN65MeoRi05GA_gXIMwG4YDIeA" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
