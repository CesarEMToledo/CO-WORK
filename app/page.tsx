import { Navbar } from "@/components/ui/Navbar";
import { CategoryFilters } from "@/components/ui/CategoryFilters";
import { FeaturedCarousel } from "@/components/properties/FeaturedCarousel";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { featuredCollections, marketUpdates } from "@/data/mockProperties";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <section className="py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-on-surface leading-tight">
              Encuentra tu <span className="relative inline-block">
                <span className="relative z-10 text-primary">santuario</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-primary/10 -rotate-1 z-0"></span>
              </span> en la Huasteca.
            </h1>
            <div className="relative group max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-icons text-on-surface-variant/60 text-2xl group-focus-within:text-primary transition-colors">search</span>
              </div>
              <input className="block w-full pl-12 pr-4 py-4 rounded-lg border-none bg-white text-on-surface shadow-soft placeholder-on-surface-variant/40 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-lg" placeholder="Busca por ciudad, paraje o dirección..." type="text" />
              <button className="absolute inset-y-2 right-2 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-primary/20">
                Buscar
              </button>
            </div>
            <CategoryFilters />
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-on-surface">Colecciones Destacadas</h2>
              <p className="text-on-surface-variant mt-1 text-sm">Propiedades curadas para una estancia inolvidable en San Luis Potosí.</p>
            </div>
            <a className="hidden sm:flex items-center gap-1 text-sm font-bold text-primary hover:opacity-70 transition-opacity" href="#">
              Ver todas <span className="material-icons text-sm">arrow_forward</span>
            </a>
          </div>
          <FeaturedCarousel properties={featuredCollections} />
        </section>

        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-on-surface">Novedades en el Mercado</h2>
              <p className="text-on-surface-variant mt-1 text-sm">Oportunidades frescas en los mejores parajes turísticos.</p>
            </div>
            <div className="hidden md:flex bg-sahara-container p-1 rounded-lg">
              <button className="px-4 py-1.5 rounded-lg text-sm font-bold bg-primary text-white shadow-sm">Todos</button>
              <button className="px-4 py-1.5 rounded-lg text-sm font-bold text-on-surface-variant hover:text-primary">Venta</button>
              <button className="px-4 py-1.5 rounded-lg text-sm font-bold text-on-surface-variant hover:text-primary">Renta</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {marketUpdates.map((property, idx) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                className={idx === 4 ? "hidden xl:flex" : idx === 5 ? "hidden lg:flex" : ""}
              />
            ))}
          </div>
          <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-white border border-outline/20 hover:border-primary hover:text-primary text-on-surface font-bold rounded-lg transition-all hover:shadow-md">
              Cargar más propiedades
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
