import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        // Fotos de perfil y de propiedades subidas a Supabase Storage.
        // Con comodín para que funcione con cualquier proyecto de Supabase
        // (el compartido del equipo, o el propio de quien esté desarrollando).
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
