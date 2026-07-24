"use client";

import { Heart } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { allProperties } from "@/data/mockProperties";
import { useFavorites } from "@/lib/use-favorites";
import { usePublishedProperties } from "@/lib/use-published-properties";

export default function FavoritosPage() {
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { published } = usePublishedProperties();

  const favoriteProperties = [...published, ...allProperties].filter((p) => favorites.has(p.id));

  return (
    <>
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
        <h1 className="text-3xl font-extrabold text-on-surface mb-1">Tus favoritos</h1>
        <p className="text-on-surface-variant text-sm mb-8">Propiedades que guardaste para revisar más tarde.</p>

        {favoriteProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-sahara-container rounded-full flex items-center justify-center mb-4">
              <Heart size={28} className="text-on-surface-variant" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-on-surface">Aún no tienes favoritos</h3>
            <p className="text-on-surface-variant text-sm max-w-xs">
              Toca el corazón en cualquier propiedad para guardarla aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteProperties.map((property, idx) => (
              <div key={property.id} className="animate-fade-in h-full" style={{ animationDelay: `${Math.min(idx, 7) * 60}ms` }}>
                <PropertyCard
                  property={property}
                  isFavorite={isFavorite(property.id)}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
