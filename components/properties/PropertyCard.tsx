import { Property } from "@/data/mockProperties";

export function PropertyCard({ property, className = "" }: { property: Property; className?: string }) {
  return (
    <article className={`bg-white rounded-lg overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group cursor-pointer h-full flex flex-col ${className}`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img alt={property.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={property.imageUrl} />
        <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-lg hover:bg-primary hover:text-white transition-colors text-on-surface">
          <span className="material-icons text-lg">favorite_border</span>
        </button>
        <div className={`absolute bottom-3 left-3 text-white text-[10px] font-extrabold px-2 py-1 rounded-lg ${property.type === 'VENTA' ? 'bg-on-surface' : 'bg-primary'}`}>
          EN {property.type}
        </div>
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
              <span className="material-icons text-sm text-primary">{spec.icon}</span> {spec.label}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
