export function CategoryFilters() {
  return (
    <div className="flex items-center justify-center gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
      <button className="whitespace-nowrap px-5 py-2 rounded-lg bg-on-surface text-white text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5">
        Todos
      </button>
      {['Cabañas', 'Ecolodges', 'Villas', 'Glamping'].map((category) => (
        <button key={category} className="whitespace-nowrap px-5 py-2 rounded-lg bg-white border border-outline/10 text-on-surface-variant hover:text-primary hover:border-primary/50 text-sm font-bold transition-all hover:bg-primary/5">
          {category}
        </button>
      ))}
      <div className="w-px h-6 bg-outline/20 mx-2"></div>
      <button className="whitespace-nowrap flex items-center gap-1 px-4 py-2 rounded-lg text-on-surface font-bold text-sm hover:bg-primary/10 transition-colors">
        <span className="material-icons text-base">tune</span> Filtros
      </button>
    </div>
  );
}
