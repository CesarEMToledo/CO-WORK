"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, Globe, ChevronDown, Check, Plus, Menu, X, Heart, User, LogOut, ShieldCheck, BarChart3, AlertTriangle, Wrench, UserCog } from "lucide-react";
import { CoworkLogo } from "@/components/CoworkLogo";
import { useSupabaseUser } from "@/components/SessionProviderWrapper";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user: authUser, status } = useSupabaseUser();
  const user = authUser
    ? {
        name: (authUser.user_metadata?.name as string | undefined) ?? authUser.email ?? "Usuario",
        role: (authUser.app_metadata?.role as string | undefined) ?? "client",
        avatarUrl: authUser.user_metadata?.avatar_url as string | undefined,
      }
    : null;

  const Avatar = ({ size }: { size: number }) =>
    user?.avatarUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt=""
        style={{ width: size, height: size }}
        className="rounded-full object-cover shrink-0"
      />
    ) : (
      <User size={size} />
    );

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

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
            {navLink("/explorar", "Explorar")}
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
                  <Avatar size={18} />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown size={16} />
                </button>
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-soft border border-outline/10 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link href="/perfil" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-primary hover:bg-primary/5">
                    <UserCog size={14} /> Mi perfil
                  </Link>
                  {user.role === "admin" && (
                    <>
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-primary hover:bg-primary/5">
                        <ShieldCheck size={14} /> Panel admin
                      </Link>
                      <Link href="/admin/reportes" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-primary hover:bg-primary/5">
                        <BarChart3 size={14} /> Reportes
                      </Link>
                      <Link href="/admin/incidencias" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-primary hover:bg-primary/5">
                        <Wrench size={14} /> Incidencias
                      </Link>
                    </>
                  )}
                  <Link href="/reportes" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-primary hover:bg-primary/5">
                    <AlertTriangle size={14} /> Reportar problema
                  </Link>
                  <button
                    onClick={() => signOut()}
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
          {navLink("/explorar", "Explorar", "block py-2")}
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
              <Link
                href="/perfil"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-on-surface-variant hover:text-primary font-semibold text-sm transition-all"
              >
                <UserCog size={16} /> Mi perfil
              </Link>
              {user.role === "admin" && (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-on-surface-variant hover:text-primary font-semibold text-sm transition-all"
                  >
                    <ShieldCheck size={16} /> Panel admin
                  </Link>
                  <Link
                    href="/admin/reportes"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-on-surface-variant hover:text-primary font-semibold text-sm transition-all"
                  >
                    <BarChart3 size={16} /> Reportes
                  </Link>
                  <Link
                    href="/admin/incidencias"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-on-surface-variant hover:text-primary font-semibold text-sm transition-all"
                  >
                    <Wrench size={16} /> Incidencias
                  </Link>
                </>
              )}
              <Link
                href="/reportes"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-on-surface-variant hover:text-primary font-semibold text-sm transition-all"
              >
                <AlertTriangle size={16} /> Reportar problema
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
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
