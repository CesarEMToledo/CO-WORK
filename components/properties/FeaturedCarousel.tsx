"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { Property } from "@/data/mockProperties";
import { SpecIcon } from "@/lib/spec-icon";

interface FeaturedCarouselProps {
  properties: Property[];
  isFavorite?: (id: string) => boolean;
  onToggleFavorite?: (id: string) => void;
}

export function FeaturedCarousel({ properties, isFavorite, onToggleFavorite }: FeaturedCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = 2; // Fixed for lg breakpoint logic simplified
  const totalSlides = Math.ceil(properties.length / itemsPerSlide);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const slideGroups = [];
  for (let i = 0; i < properties.length; i += itemsPerSlide) {
    slideGroups.push(properties.slice(i, i + itemsPerSlide));
  }

  if (totalSlides === 0) return null;

  return (
    <div className="carousel-container group/carousel relative overflow-hidden">
      <div
        className="carousel-track flex transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slideGroups.map((group, slideIndex) => (
          <div key={slideIndex} className="carousel-slide flex-[0_0_100%] grid grid-cols-1 lg:grid-cols-2 gap-8 px-1">
            {group.map((property) => {
              const favorite = isFavorite?.(property.id) ?? false;
              return (
                <Link
                  href={`/propiedad/${property.id}`}
                  key={property.id}
                  className="group relative rounded-lg overflow-hidden shadow-soft bg-white cursor-pointer h-full block"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden relative">
                    <Image
                      alt={property.title}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      src={property.imageUrl}
                    />
                    {property.badge && (
                      <div className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        property.badge.variant === 'primary' ? 'bg-primary text-white' : 'bg-sahara-dim text-on-surface'
                      }`}>
                        {property.badge.text}
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onToggleFavorite?.(property.id);
                      }}
                      aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                      aria-pressed={favorite}
                      className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-on-surface hover:bg-primary hover:text-white transition-all"
                    >
                      <Heart size={20} fill={favorite ? "currentColor" : "none"} className={favorite ? "text-primary" : ""} />
                    </button>
                  </div>
                  <div className="p-6 relative bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-extrabold text-on-surface group-hover:text-primary transition-colors">{property.title}</h3>
                        <p className="text-on-surface-variant text-sm flex items-center gap-1 mt-1">
                          <MapPin size={14} /> {property.location}
                        </p>
                      </div>
                      <span className="text-xl font-extrabold text-primary">{property.price}</span>
                    </div>
                    <div className="flex items-center gap-6 mt-6 pt-6 border-t border-outline/10">
                      {property.specs.map((spec, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
                          <SpecIcon name={spec.icon} className="w-4 h-4" /> {spec.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-2 mt-8">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentSlide === idx ? 'bg-primary w-6' : 'bg-outline/20 w-2'
            }`}
            aria-label={`Ir a la diapositiva ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
