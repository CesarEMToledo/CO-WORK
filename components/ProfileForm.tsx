"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, Camera } from "lucide-react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image-compress";

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Elige un archivo de imagen (jpg, png, webp, gif).");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setProfileError("La imagen debe pesar menos de 15MB.");
      return;
    }

    setProfileError("");
    setUploading(true);

    const supabase = createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      setUploading(false);
      setProfileError("Tu sesión expiró, vuelve a iniciar sesión.");
      return;
    }

    // Reducimos peso/tamaño antes de subir — se ve prácticamente igual pero
    // ocupa mucho menos espacio en Supabase Storage. Las fotos de perfil se
    // ven chicas en la página, así que no hace falta que pesen tanto.
    const upload = await compressImage(file, { maxWidth: 512, maxHeight: 512, quality: 0.85 });

    const ext = upload.name.split(".").pop() || "jpg";
    // Usamos un nombre fijo por usuario (no el original) para no acumular
    // archivos viejos cada vez que alguien cambia su foto — upsert lo
    // reemplaza en el mismo lugar.
    const path = `${authUser.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, upload, { upsert: true, contentType: upload.type });

    setUploading(false);

    if (uploadError) {
      setProfileError("No se pudo subir la foto. Intenta de nuevo.");
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // Le agregamos un parámetro con la hora para que el navegador no muestre
    // la foto vieja en caché si ya habías subido una antes.
    setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess(false);
    setSaving(true);

    const supabase = createClient();

    // 1) Reflejamos los cambios en Supabase Auth (así el nombre/foto en el
    // menú de arriba se actualiza al instante, sin recargar).
    await supabase.auth.updateUser({
      data: { name, avatar_url: avatarUrl || null },
    });

    // 2) Guardamos el perfil "de verdad" en nuestra base (lo que usan las
    // pantallas de admin, reservas, etc.).
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone: phone || null, avatarUrl: avatarUrl || null }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setProfileError(data.error ?? "No se pudo guardar tu perfil");
      return;
    }

    setProfileSuccess(true);
    router.refresh();
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    setPasswordLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);

    if (error) {
      setPasswordError("No se pudo cambiar la contraseña. Intenta de nuevo.");
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setPasswordSuccess(true);
  };

  return (
    <div className="space-y-10">
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative w-20 h-20 rounded-full bg-sahara-container flex items-center justify-center overflow-hidden shrink-0 group"
            aria-label="Cambiar foto de perfil"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={32} className="text-on-surface-variant" />
            )}
            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera size={20} className="text-white" />
            </span>
          </button>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-sm font-bold text-primary underline underline-offset-2 disabled:opacity-60"
            >
              {uploading ? "Subiendo..." : "Cambiar foto"}
            </button>
            <p className="text-xs text-on-surface-variant mt-1">
              JPG, PNG, WEBP o GIF — la optimizamos automáticamente al subirla.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-on-surface mb-1.5">Correo</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-sahara-container/40 text-on-surface-variant"
          />
          <p className="text-xs text-on-surface-variant mt-1">
            El correo no se puede cambiar desde aquí.
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-on-surface mb-1.5">Nombre completo</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-on-surface mb-1.5">Número de celular</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej. 481 123 4567"
            className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {profileError && <p className="text-sm font-medium text-red-600">{profileError}</p>}
        {profileSuccess && <p className="text-sm font-medium text-emerald-600">Perfil actualizado.</p>}

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold rounded-lg transition-colors"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="space-y-5 border-t border-outline/10 pt-8">
        <h2 className="text-lg font-bold text-on-surface">Cambiar contraseña</h2>

        <div>
          <label className="block text-sm font-bold text-on-surface mb-1.5">Nueva contraseña</label>
          <PasswordInput
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-on-surface mb-1.5">Confirmar nueva contraseña</label>
          <PasswordInput
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {passwordError && <p className="text-sm font-medium text-red-600">{passwordError}</p>}
        {passwordSuccess && (
          <p className="text-sm font-medium text-emerald-600">Contraseña actualizada.</p>
        )}

        <button
          type="submit"
          disabled={passwordLoading}
          className="w-full py-3 bg-on-surface hover:bg-on-surface/90 disabled:opacity-60 text-white font-bold rounded-lg transition-colors"
        >
          {passwordLoading ? "Actualizando..." : "Actualizar contraseña"}
        </button>
      </form>
    </div>
  );
}
