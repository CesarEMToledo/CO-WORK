"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Property } from "@/data/mockProperties";
import { SpecIcon } from "@/lib/spec-icon";
import { CategoryBadge } from "@/components/properties/CategoryBadge";
import { getGalleryForProperty } from "@/lib/property-details";

const CARD_ROTATE_MS = 4000;

interface PropertyCardProps {
  property: Property;
  className?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export function PropertyCard({ property, className = "", isFavorite = false, onToggleFavorite }: PropertyCardProps) {
  const gallery = getGalleryForProperty(property);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (gallery.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % gallery.length);
    }, CARD_ROTATE_MS);
    return () => clearInterval(timer);
  }, [gallery.length]);

  return (
    <Link
      href={`/propiedad/${property.id}`}
      className={`bg-white rounded-lg overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group cursor-pointer h-full flex flex-col ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          alt={property.title}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          src={gallery[activeImage]}
        />
        <CategoryBadge category={property.category} className="absolute top-3 left-3" />
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite?.(property.id);
          }}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          aria-pressed={isFavorite}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-lg hover:bg-primary hover:text-white transition-colors text-on-surface"
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "text-primary" : ""} />
        </button>
        <div className={`absolute bottom-3 left-3 text-white text-[10px] font-extrabold px-2 py-1 rounded-lg ${property.type === 'VENTA' ? 'bg-on-surface' : 'bg-primary'}`}>
          EN {property.type}
        </div>
        {gallery.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1">
            {gallery.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeImage ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-extrabold text-xl text-on-surface mb-1">
          {property.price} {property.priceSuffix ? <span className="text-sm font-bold text-on-surface-variant">{property.priceSuffix}</span> : null}
        </h3>
        <h4 className="text-on-surface-variant font-bold truncate mb-1">{property.title}</h4>
        <p className="text-on-surface-variant/70 text-xs mb-4">{property.location}</p>
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-outline/10">
          {property.specs.map((spec, idx) => (
            <div key={idx} className="flex items-center gap-1 text-on-surface-variant text-xs font-bold">
              <SpecIcon name={spec.icon} className="w-4 h-4 text-primary" /> {spec.label}
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
