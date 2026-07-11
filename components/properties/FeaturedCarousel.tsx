"use client";

import { useState, useEffect } from "react";
import { Property } from "@/data/mockProperties";

export function FeaturedCarousel({ properties }: { properties: Property[] }) {
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
            {group.map((property) => (
              <div key={property.id} className="group relative rounded-lg overflow-hidden shadow-soft bg-white cursor-pointer h-full">
                <div className="aspect-[4/3] w-full overflow-hidden relative">
                  <img alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={property.imageUrl} />
                  {property.badge && (
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      property.badge.variant === 'primary' ? 'bg-primary text-white' : 'bg-sahara-dim text-on-surface'
                    }`}>
                      {property.badge.text}
                    </div>
                  )}
                  <button className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-on-surface hover:bg-primary hover:text-white transition-all">
                    <span className="material-icons text-xl">favorite_border</span>
                  </button>
                </div>
                <div className="p-6 relative bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-extrabold text-on-surface group-hover:text-primary transition-colors">{property.title}</h3>
                      <p className="text-on-surface-variant text-sm flex items-center gap-1 mt-1">
                        <span className="material-icons text-sm">place</span> {property.location}
                      </p>
                    </div>
                    <span className="text-xl font-extrabold text-primary">{property.price}</span>
                  </div>
                  <div className="flex items-center gap-6 mt-6 pt-6 border-t border-outline/10">
                    {property.specs.map((spec, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
                        <span className="material-icons text-lg">{spec.icon}</span> {spec.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
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
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
