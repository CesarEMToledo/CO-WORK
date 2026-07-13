import {
  BedDouble,
  Bath,
  Droplet,
  Waves,
  TreePine,
  Flame,
  Sun,
  Landmark,
  Trees,
  Ruler,
  Mountain,
  Building2,
  Leaf,
  Star,
  Sprout,
  Home,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  king_bed: BedDouble,
  bathtub: Bath,
  water_drop: Droplet,
  pool: Waves,
  forest: TreePine,
  waves: Droplet,
  local_fire_department: Flame,
  wb_sunny: Sun,
  history_edu: Landmark,
  park: Trees,
  square_foot: Ruler,
  terrain: Mountain,
  apartment: Building2,
  eco: Leaf,
  star: Star,
  grass: Sprout,
  home: Home,
};

export function SpecIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Home;
  return <Icon className={className} />;
}
