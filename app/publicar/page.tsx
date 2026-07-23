import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { PublicarForm } from "@/components/PublicarForm";

// Publicar una propiedad ahora requiere haber iniciado sesión — así la
// propiedad se puede ligar al usuario para "Mis propiedades" (ver
// app/perfil/propiedades/page.tsx). Antes cualquiera podía publicar sin
// cuenta porque todo vivía en localStorage.
export default async function PublicarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/publicar");

  return <PublicarForm />;
}
