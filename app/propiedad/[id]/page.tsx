"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Heart,
  MapPin,
  Phone,
  Calendar,
  LogIn,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Video,
  Play,
  X,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { LoginGate } from "@/components/ui/LoginGate";
import { useSupabaseUser } from "@/components/SessionProviderWrapper";
import { SpecIcon } from "@/lib/spec-icon";
import { CategoryBadge } from "@/components/properties/CategoryBadge";
import { allProperties } from "@/data/mockProperties";
import { useFavorites } from "@/lib/use-favorites";
import { usePublishedProperties } from "@/lib/use-published-properties";
import {
  getAgentForProperty,
  getAmenitiesForProperty,
  getBillingInfo,
  getCoordinatesForProperty,
  getGalleryForProperty,
} from "@/lib/property-details";
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";

const PropertyMap = dynamic(
  () => import("@/components/properties/PropertyMap").then((mod) => mod.PropertyMap),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-sahara-container/60 animate-pulse" />,
  }
);

const HERO_ROTATE_MS = 5000;

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.1h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.55-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.23-.17-.48-.29z" />
    </svg>
  );
}

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { status } = useSupabaseUser();
  const authenticated = status === "authenticated";
  const { published } = usePublishedProperties();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showFiscal, setShowFiscal] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const property = [...published, ...allProperties].find((p) => p.id === params.id);
  const gallery = property ? getGalleryForProperty(property) : [];

  const [prevPropertyId, setPrevPropertyId] = useState(property?.id);
  if (property?.id !== prevPropertyId) {
    setPrevPropertyId(property?.id);
    setActiveImage(0);
    setVideoPlaying(false);
  }

  useEffect(() => {
    if (gallery.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % gallery.length);
    }, HERO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [gallery.length]);

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

  const agent = getAgentForProperty(property);
  const coordinates = getCoordinatesForProperty(property);
  const amenities = getAmenitiesForProperty(property);
  const billing = getBillingInfo(property);
  const videoEmbedUrl = property.videoUrl ? getYouTubeEmbedUrl(property.videoUrl) : null;
  const videoThumbnail = property.videoUrl ? getYouTubeThumbnailUrl(property.videoUrl) : null;

  const ctaLabel = property.type === "VENTA" ? "Agendar Cita" : "Reservar Espacio";

  const generalMessage = encodeURIComponent(
    `Hola, me interesa "${property.title}" (${property.location}) que vi en CO-WORK.`
  );

  const waContactUrl = `https://wa.me/52${agent.phone}?text=${generalMessage}`;
  const telUrl = `tel:+52${agent.phone}`;
  const googleMapsUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;

  const goPrevImage = () => setActiveImage((i) => (i - 1 + gallery.length) % gallery.length);
  const goNextImage = () => setActiveImage((i) => (i + 1) % gallery.length);

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

        <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-3">
          <Image
            alt={property.title}
            fill
            priority
            sizes="(min-width: 1024px) 960px, 100vw"
            className="object-cover transition-opacity duration-500"
            src={gallery[activeImage]}
          />
          <CategoryBadge category={property.category} className="absolute top-4 left-4" />
          <div className={`absolute top-4 right-4 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg ${property.type === 'VENTA' ? 'bg-on-surface' : 'bg-primary'}`}>
            EN {property.type}
          </div>
          {gallery.length > 1 && (
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/95 hover:bg-white text-on-surface text-sm font-bold rounded-lg shadow-card transition-colors"
            >
              <LayoutGrid size={16} /> Ver todas las fotos
            </button>
          )}
        </div>

        {gallery.length > 1 && (
          <div className="grid grid-cols-4 gap-3 mb-8">
            {gallery.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                aria-label={`Ver foto ${idx + 1}`}
                aria-pressed={activeImage === idx}
                className={`relative aspect-[4/3] rounded-lg overflow-hidden ring-2 transition-all ${
                  activeImage === idx ? "ring-primary" : "ring-transparent hover:ring-primary/40"
                }`}
              >
                <Image
                  alt={`${property.title} - foto ${idx + 1}`}
                  fill
                  sizes="(min-width: 1024px) 20vw, 25vw"
                  className="object-cover"
                  src={img}
                />
              </button>
            ))}
          </div>
        )}

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
            <LoginGate label="la ubicación" className="mb-6">
              <p className="text-on-surface-variant flex items-center gap-1.5">
                <MapPin size={16} /> {property.location}
              </p>
            </LoginGate>

            <div className="flex items-center gap-8 py-6 border-y border-outline/10 mb-6">
              {property.specs.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2 text-on-surface font-semibold text-sm">
                  <SpecIcon name={spec.icon} className="w-5 h-5 text-primary" />
                  {spec.label}
                </div>
              ))}
            </div>

            <h2 className="text-lg font-bold text-on-surface mb-2">Descripción</h2>
            <p className="text-on-surface-variant leading-relaxed mb-8">{property.description}</p>

            {property.specs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-on-surface mb-4">Características de la Residencia</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {property.specs.map((spec, idx) => (
                    <div
                      key={idx}
                      className="bg-sahara-container/60 rounded-lg p-4 flex flex-col items-center text-center gap-2"
                    >
                      <SpecIcon name={spec.icon} className="w-6 h-6 text-primary" />
                      <span className="font-extrabold text-on-surface text-sm">{spec.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {amenities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-on-surface mb-4">Amenidades Exclusivas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {amenities.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-on-surface-variant">
                      <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {videoEmbedUrl && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                  <Video size={18} className="text-primary" /> Recorrido en Video
                </h2>
                <div className="relative aspect-video rounded-lg overflow-hidden shadow-card bg-on-surface">
                  {videoPlaying ? (
                    <iframe
                      src={`${videoEmbedUrl}?autoplay=1&rel=0`}
                      title={`Video de ${property.title}`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      onClick={() => setVideoPlaying(true)}
                      aria-label={`Reproducir video de ${property.title}`}
                      className="absolute inset-0 w-full h-full group"
                    >
                      {videoThumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={videoThumbnail}
                          alt={`Miniatura del video de ${property.title}`}
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity"
                        />
                      )}
                      <div className="absolute inset-0 bg-on-surface/30 group-hover:bg-on-surface/20 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary group-hover:bg-primary/90 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                          <Play size={26} fill="currentColor" className="ml-1" />
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {billing.available && (
              <div className="rounded-lg bg-sahara-container/60 border border-sahara-dim p-4">
                <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                  <div className="flex items-start gap-3">
                    <Info size={20} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-on-surface text-sm">Facturación Disponible</p>
                      <p className="text-sm text-on-surface-variant">{billing.note}</p>
                    </div>
                  </div>
                  {billing.detail && (
                    <button
                      onClick={() => setShowFiscal((v) => !v)}
                      aria-expanded={showFiscal}
                      className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white border border-outline/20 hover:border-primary hover:text-primary text-on-surface font-bold text-sm rounded-lg transition-colors"
                    >
                      Ver Detalles Fiscales
                      {showFiscal ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  )}
                </div>
                {showFiscal && billing.detail && (
                  <p className="text-sm text-on-surface-variant mt-3 pt-3 border-t border-sahara-dim">
                    {billing.detail}
                  </p>
                )}
              </div>
            )}
          </div>

          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-card p-6 lg:sticky lg:top-24">
              <LoginGate label="el precio y la ubicación" className="mb-5">
                <p className="text-3xl font-extrabold text-on-surface mb-1">
                  {property.price}{" "}
                  {property.priceSuffix && (
                    <span className="text-base font-bold text-on-surface-variant">{property.priceSuffix}</span>
                  )}
                </p>
                <p className="text-sm text-on-surface-variant">{property.location}</p>
              </LoginGate>

              <LoginGate label="el contacto del agente" mode="replace" className="mb-5">
                <div className="flex items-center justify-between gap-3 py-4 border-y border-outline/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-sm">
                      {agent.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-on-surface text-sm truncate">{agent.name}</p>
                      <p className="text-xs font-semibold text-primary truncate">{agent.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={waContactUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Escribir a ${agent.name} por WhatsApp`}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                    >
                      <WhatsAppIcon size={16} />
                    </a>
                    <a
                      href={telUrl}
                      aria-label={`Llamar a ${agent.name}`}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline/20 text-on-surface hover:border-primary hover:text-primary transition-colors"
                    >
                      <Phone size={16} />
                    </a>
                  </div>
                </div>
              </LoginGate>

              {authenticated ? (
                <Link
                  href={`/propiedad/${property.id}/visita`}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg py-3 transition-colors"
                >
                  <Calendar size={18} /> {ctaLabel}
                </Link>
              ) : (
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(`/propiedad/${property.id}/visita`)}`}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg py-3 transition-colors"
                >
                  <LogIn size={18} /> Inicia sesión para {property.type === "VENTA" ? "agendar" : "reservar"}
                </Link>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-card p-4">
              <h3 className="font-bold text-on-surface mb-3 flex items-center gap-1.5 text-sm">
                <MapPin size={16} className="text-primary" /> Ubicación
              </h3>
              <LoginGate label="la ubicación en el mapa" mode="replace" className="min-h-[14rem]">
                <div className="rounded-lg overflow-hidden h-56 border border-outline/10">
                  <PropertyMap
                    key={property.id}
                    lat={coordinates.lat}
                    lng={coordinates.lng}
                    title={property.title}
                    location={property.location}
                  />
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  Ver en el mapa <MapPin size={14} />
                </a>
              </LoginGate>
            </div>
          </aside>
        </div>
      </main>
      <Footer />

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Cerrar galería"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X size={22} />
          </button>

          <div
            className="relative w-full max-w-4xl aspect-[16/9]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              alt={`${property.title} - foto ${activeImage + 1}`}
              fill
              sizes="(min-width: 1024px) 960px, 100vw"
              className="object-contain"
              src={gallery[activeImage]}
            />
            {gallery.length > 1 && (
              <>
                <button
                  onClick={goPrevImage}
                  aria-label="Foto anterior"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={goNextImage}
                  aria-label="Foto siguiente"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
              {gallery.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  aria-label={`Ir a la foto ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeImage === idx ? "bg-primary w-6" : "bg-white/30 w-2"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
