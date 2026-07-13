"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Search, Bell, Globe, ChevronDown, Check, Plus, Menu, X, Heart, User, LogOut, ShieldCheck } from "lucide-react";
import { CoworkLogo } from "@/components/CoworkLogo";

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user;

  const navLink = (href: string, label: string, className = "") => (
    <Link
      href={href}
      onClick={() => setMenuOpen(false)}
      className={
        (pathname === href
          ? "text-primary font-bold text-sm border-b-2 border-primary px-1 py-1"
          : "text-on-surface-variant hover:text-primary font-semibold text-sm px-1 py-1 transition-all") +
        " " +
        className
      }
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-outline/10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link href="/" className="shrink-0 flex items-center gap-2 cursor-pointer">
            <CoworkLogo className="w-8 h-8 sm:w-9 sm:h-9" />
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-on-surface uppercase">CO-WORK</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            {navLink("/", "Inicio")}
            {navLink("/?op=venta", "Compra")}
            {navLink("/?op=renta", "Renta")}
            {navLink("/favoritos", "Favoritos")}
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/publicar"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-lg transition-colors"
            >
              <Plus size={16} />
              Publicar
            </Link>
            <div className="relative group hidden md:block">
              <button aria-label="Cambiar idioma" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm py-2">
                <Globe size={18} />
                <span className="text-sm">ES</span>
                <ChevronDown size={16} />
              </button>
              <div className="absolute top-full right-0 mt-1 w-24 bg-white rounded-lg shadow-soft border border-outline/10 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="flex items-center justify-between px-4 py-2 text-xs font-bold text-primary bg-primary/5">
                  <span>ES</span>
                  <Check size={14} />
                </div>
                <button className="w-full text-left block px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-primary hover:bg-primary/5">EN</button>
              </div>
            </div>
            <button aria-label="Buscar" className="hidden sm:inline-flex text-on-surface-variant hover:text-primary transition-colors">
              <Search size={20} />
            </button>
            <button aria-label="Notificaciones" className="hidden md:inline-flex text-on-surface-variant hover:text-primary transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
            </button>

            {status === "authenticated" && user ? (
              <div className="relative group hidden md:block">
                <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm py-2">
                  <User size={18} />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown size={16} />
                </button>
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-soft border border-outline/10 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {user.role === "admin" && (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-primary hover:bg-primary/5">
                      <ShieldCheck size={14} /> Panel admin
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-primary hover:bg-primary/5"
                  >
                    <LogOut size={14} /> Cerrar sesión
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="hidden md:flex items-center gap-1.5 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
                <User size={18} /> Ingresar
              </Link>
            )}

            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              className="md:hidden text-on-surface-variant hover:text-primary transition-colors"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-outline/10 bg-background px-4 py-4 space-y-1">
          {navLink("/", "Inicio", "block py-2")}
          {navLink("/?op=venta", "Compra", "block py-2")}
          {navLink("/?op=renta", "Renta", "block py-2")}
          <Link
            href="/favoritos"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-on-surface-variant hover:text-primary font-semibold text-sm transition-all"
          >
            <Heart size={16} /> Favoritos
          </Link>

          {status === "authenticated" && user ? (
            <>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-on-surface-variant hover:text-primary font-semibold text-sm transition-all"
                >
                  <ShieldCheck size={16} /> Panel admin
                </Link>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex items-center gap-2 py-2 text-on-surface-variant hover:text-primary font-semibold text-sm transition-all"
              >
                <LogOut size={16} /> Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-on-surface-variant hover:text-primary font-semibold text-sm transition-all"
            >
              <User size={16} /> Ingresar
            </Link>
          )}

          <Link
            href="/publicar"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-1.5 mt-3 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-lg transition-colors"
          >
            <Plus size={16} />
            Publicar propiedad
          </Link>
        </div>
      )}
    </nav>
  );
}
