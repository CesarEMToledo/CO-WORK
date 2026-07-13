"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, MapPin, Phone, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { SpecIcon } from "@/lib/spec-icon";
import { allProperties } from "@/data/mockProperties";
import { useFavorites } from "@/lib/use-favorites";
import { usePublishedProperties } from "@/lib/use-published-properties";

const CONTACT_PHONE = "4811119463";

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { published } = usePublishedProperties();
  const { isFavorite, toggleFavorite } = useFavorites();

  const property = [...published, ...allProperties].find((p) => p.id === params.id);

  if (!property) {
    return (
      <>
        <Navbar />
        <main className="w-full max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-extrabold text-on-surface mb-2">Propiedad no encontrada</h1>
          <p className="text-on-surface-variant text-sm mb-6">
            Puede que el enlace esté roto o que la propiedad ya no esté disponible.
          </p>
          <Link href="/" className="text-primary font-bold text-sm underline underline-offset-2">
            Volver al inicio
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const favorite = isFavorite(property.id);
  const whatsappMessage = encodeURIComponent(`Hola, me interesa "${property.title}" (${property.location}) que vi en CO-WORK.`);

  return (
    <>
      <Navbar />
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-8">
          <Image
            alt={property.title}
            fill
            priority
            sizes="(min-width: 1024px) 960px, 100vw"
            className="object-cover"
            src={property.imageUrl}
          />
          {property.badge && (
            <div className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
              property.badge.variant === 'primary' ? 'bg-primary text-white' : 'bg-sahara-dim text-on-surface'
            }`}>
              {property.badge.text}
            </div>
          )}
          <div className={`absolute top-4 right-4 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg ${property.type === 'VENTA' ? 'bg-on-surface' : 'bg-primary'}`}>
            EN {property.type}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl font-extrabold text-on-surface">{property.title}</h1>
              <button
                onClick={() => toggleFavorite(property.id)}
                aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                aria-pressed={favorite}
                className="shrink-0 p-3 bg-white shadow-card rounded-lg hover:bg-primary hover:text-white transition-colors text-on-surface"
              >
                <Heart size={20} fill={favorite ? "currentColor" : "none"} className={favorite ? "text-primary" : ""} />
              </button>
            </div>
            <p className="text-on-surface-variant flex items-center gap-1.5 mb-6">
              <MapPin size={16} /> {property.location}
            </p>

            <div className="flex items-center gap-8 py-6 border-y border-outline/10 mb-6">
              {property.specs.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2 text-on-surface font-semibold text-sm">
                  <SpecIcon name={spec.icon} className="w-5 h-5 text-primary" />
                  {spec.label}
                </div>
              ))}
            </div>

            <h2 className="text-lg font-bold text-on-surface mb-2">Descripción</h2>
            <p className="text-on-surface-variant leading-relaxed">{property.description}</p>
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-card p-6 sticky top-24">
              <p className="text-3xl font-extrabold text-on-surface mb-1">
                {property.price}{" "}
                {property.priceSuffix && (
                  <span className="text-base font-bold text-on-surface-variant">{property.priceSuffix}</span>
                )}
              </p>
              <p className="text-sm text-on-surface-variant mb-6">Contacta directamente a CO-WORK Ciudad Valles.</p>
              <a
                href={`https://wa.me/52${CONTACT_PHONE}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg py-3 mb-3 transition-colors"
              >
                <MessageCircle size={18} /> Escribir por WhatsApp
              </a>
              <a
                href={`tel:+52${CONTACT_PHONE}`}
                className="w-full flex items-center justify-center gap-2 border border-outline/20 hover:border-primary hover:text-primary text-on-surface font-bold rounded-lg py-3 transition-colors"
              >
                <Phone size={18} /> Llamar ahora
              </a>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
