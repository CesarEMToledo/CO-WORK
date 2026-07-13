export type PropertyCategory =
  | "Cabaña"
  | "Ecolodge"
  | "Villa"
  | "Glamping"
  | "Casa"
  | "Departamento"
  | "Terreno";

export interface PropertySpec {
  icon: string;
  label: string;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  priceSuffix?: string;
  type: "VENTA" | "RENTA";
  category: PropertyCategory;
  description: string;
  specs: PropertySpec[];
  imageUrl: string;
  badge?: {
    text: string;
    variant: "primary" | "sahara";
  };
}

export const CATEGORIES: { id: PropertyCategory; label: string }[] = [
  { id: "Cabaña", label: "Cabañas" },
  { id: "Ecolodge", label: "Ecolodges" },
  { id: "Villa", label: "Villas" },
  { id: "Glamping", label: "Glamping" },
];

export const featuredCollections: Property[] = [
  {
    id: "fc-1",
    title: "Residencia Surrealista",
    location: "Xilitla, SLP",
    price: "$12,500 MXN",
    type: "RENTA",
    category: "Villa",
    description:
      "Una villa de autor a pasos del Jardín Escultórico de Edward James, con cascada privada y vistas a la selva de Xilitla.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCra-FKp81t0_OM8bWD55m2o9OOSnR_v7D0UilyExMImxyIcr9tIMZ2Py3HcC0ra_MtSsBkduMcwxUNKI9_iSXFFr_YRON1SF9hNM3fcYy-uG7N7uusL0Z367WINi1V7_GwfNQx-gsbUqLtzVi4ivFyqFQGb4qBs79bALeSFb6i3_ZnJnI1VVrN-VeZYHjfYyQI5C6zy90N3uxWZpwzIBhNoUDKKQjQ8EOEYPoyPTzhnh6b6AS3dkkFJ8t4xSDC6qjhMrQUoUPnAeM",
    badge: { text: "Exclusivo", variant: "primary" },
    specs: [
      { icon: "king_bed", label: "4 Hab" },
      { icon: "bathtub", label: "3.5 Baños" },
      { icon: "water_drop", label: "Cascada" },
    ],
  },
  {
    id: "fc-2",
    title: "Mirador del Salto",
    location: "Tamasopo, Huasteca",
    price: "$8,200 MXN",
    type: "RENTA",
    category: "Cabaña",
    description:
      "Cabaña de madera con terraza suspendida sobre las cascadas de Tamasopo, ideal para desconectarse en pareja.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDurAGHzg_fpQxFal-obkFVy1Q3WLPdueAQpz0itcQiRV-WfvulnBEDJbNeV8J06q4mX7PTtXYVJjX4-mHVr_khZLZxQ_s8f6fruGqzeqALyMu8wEHRK1EsOs9f4_jPmS7FxcdzrDkR88Wz0GjaPLXkTZRoJQfur59rxYRLi-WYcW-VU_gKS39CPLOMlftvqGvW0IOk5tXgst5mJ4WQM-ICN4vkdel9ido9YFUQga0OI10i6NSe5W4owt33-2YRi_b_ltdZW2QZC5s",
    badge: { text: "Nuevo", variant: "sahara" },
    specs: [
      { icon: "king_bed", label: "2 Hab" },
      { icon: "bathtub", label: "2 Baños" },
      { icon: "pool", label: "Alberca" },
    ],
  },
  {
    id: "fc-3",
    title: "Villa Selva Real",
    location: "Aquismón, SLP",
    price: "$9,500 MXN",
    type: "RENTA",
    category: "Villa",
    description:
      "Villa rodeada de selva alta, a minutos del Sótano de las Golondrinas, con alberca infinita y palapa para eventos.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBGq4Phm0uDzCnjHAsnWpYTBVpOds_M6iOsJuRQQA5eUZHkztGgtc7eh_OE6wBeyW1-iZh7yyhROnvvmqkAZ9tyAWFGXk0FG52zU4kZ_EDLA0U0cRszy7byNXTeWe0_hS53SYmtCTEV8Y1AM-WxiIC38UMa15QwFDjXtCGQOxoh35K0Ol_70vfsxm0VqDbaWkr8tcEbLTLy0NXH_GcpGK4lAXizgxYOIlFWGyau-4OIfPZRpjCBDbz_qu3VlN201UUJGiuM9ajVd-U",
    badge: { text: "Top Rated", variant: "primary" },
    specs: [
      { icon: "king_bed", label: "3 Hab" },
      { icon: "bathtub", label: "3 Baños" },
      { icon: "forest", label: "Selva" },
    ],
  },
  {
    id: "fc-4",
    title: "Refugio del Río",
    location: "El Naranjo, Huasteca",
    price: "$6,800 MXN",
    type: "RENTA",
    category: "Ecolodge",
    description:
      "Ecolodge frente al río, construido con materiales de la región, pensado para nadar, pescar y descansar en hamaca.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB4zNatD3vePhIZAi6OHHJKmamYSgeBNSKjEt32tvkkf4s6aBXCF8R4LNfDfPa9leA0t6N1OKOcP358WwZrnosbCBxSM7EaY2_P7qkx3MinRgmHQn7RvleNTwy8cLigMoR3iv0u83chBVbZYI6BcNMcqv80W-l1pIUgIWZcDIXEqtUatrsojSGfM0lTNDZpkBntBUkRY6NB4ZUymYNYvTHXKbO8NZ6N6uoyuuHqcaRWKzHCNXkOR3p-_EVFAHR8QwijIY_m1mefPZ4",
    badge: { text: "Ecológico", variant: "sahara" },
    specs: [
      { icon: "king_bed", label: "2 Hab" },
      { icon: "bathtub", label: "2 Baños" },
      { icon: "waves", label: "Vista Río" },
    ],
  },
  {
    id: "fc-5",
    title: "Nube de Oro Glamping",
    location: "Micos, Ciudad Valles",
    price: "$4,500 MXN",
    type: "RENTA",
    category: "Glamping",
    description:
      "Domo de glamping con terraza y fogata privada frente a las Pozas Azules de Micos, la escapada de aventura por excelencia.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuARQWC19e7mleUpjb8CWLztEv_svJeRFOaC2i-9r9GctFuX5Barzhfai9wNM1WW8bcGlqdFM32d3KPf7SItom5ijdHOz5rGGQPeT7PlWs8-y9LkfcsHLQqsLxalhxP94XJo76_mAMp7T2dVj3hPKHNzTDLLiS6ujSdSsyo3onxQthp4ZkVE8op92gyTLUUucaGaxO8vJvyhH3HuWB07EPqT1WsW0lr9Of5lUPonjG9eiqE1XiJXTqzXUZQt5JorfPwCO1MioZA_Zro",
    badge: { text: "Aventura", variant: "primary" },
    specs: [
      { icon: "king_bed", label: "1 Hab" },
      { icon: "local_fire_department", label: "Fogata" },
      { icon: "wb_sunny", label: "Terraza" },
    ],
  },
  {
    id: "fc-6",
    title: "Hacienda La Potosina",
    location: "Rayón, Huasteca",
    price: "$15,000 MXN",
    type: "RENTA",
    category: "Villa",
    description:
      "Hacienda centenaria restaurada, con jardines extensos y arquitectura colonial, perfecta para reuniones familiares grandes.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDuQ9M7U6euA6_cXmYuXnej-N5IuawAW8ds-4G1mzfqmiBc13qXsPhf9_j_zTB8gfEunrBHo8xMsxYwCw_pl8fsxbxRkmyvLR1N9Tiye5ZJG7fwlLn9MwyBanXYhE0emGwp59es1FEyQTRQbmXLUKO74Yj34ZHqrqIkOtMKhP8CmRFvfoHT5LAe10105vUhKNkxIBvtt530nfLigSUTemOOcJMVNmsgactntRJUwOBU_TZzND7BYtDklr8uZcNYlQOK5U74-ufIf-E",
    badge: { text: "Histórico", variant: "sahara" },
    specs: [
      { icon: "king_bed", label: "5 Hab" },
      { icon: "history_edu", label: "Patrimonio" },
      { icon: "park", label: "Jardín Extenso" },
    ],
  },
];

export const marketUpdates: Property[] = [
  {
    id: "mu-1",
    title: "Villa Jardín Valles",
    location: "Fracc. Lomas, Ciudad Valles",
    price: "$4,850,000",
    priceSuffix: "MXN",
    type: "VENTA",
    category: "Villa",
    description:
      "Residencia familiar en fraccionamiento privado de Lomas, con jardín amplio, cocina integral y cochera para dos autos.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDuQ9M7U6euA6_cXmYuXnej-N5IuawAW8ds-4G1mzfqmiBc13qXsPhf9_j_zTB8gfEunrBHo8xMsxYwCw_pl8fsxbxRkmyvLR1N9Tiye5ZJG7fwlLn9MwyBanXYhE0emGwp59es1FEyQTRQbmXLUKO74Yj34ZHqrqIkOtMKhP8CmRFvfoHT5LAe10105vUhKNkxIBvtt530nfLigSUTemOOcJMVNmsgactntRJUwOBU_TZzND7BYtDklr8uZcNYlQOK5U74-ufIf-E",
    specs: [
      { icon: "king_bed", label: "3" },
      { icon: "bathtub", label: "2" },
      { icon: "square_foot", label: "250m²" },
    ],
  },
  {
    id: "mu-2",
    title: "Loft Rio El Naranjo",
    location: "Av. Cascada, El Naranjo",
    price: "$3,500",
    priceSuffix: "/noche",
    type: "RENTA",
    category: "Cabaña",
    description:
      "Loft acogedor con vista directa al río, a un paso de las pozas de El Naranjo. Ideal para escapadas cortas.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB4zNatD3vePhIZAi6OHHJKmamYSgeBNSKjEt32tvkkf4s6aBXCF8R4LNfDfPa9leA0t6N1OKOcP358WwZrnosbCBxSM7EaY2_P7qkx3MinRgmHQn7RvleNTwy8cLigMoR3iv0u83chBVbZYI6BcNMcqv80W-l1pIUgIWZcDIXEqtUatrsojSGfM0lTNDZpkBntBUkRY6NB4ZUymYNYvTHXKbO8NZ6N6uoyuuHqcaRWKzHCNXkOR3p-_EVFAHR8QwijIY_m1mefPZ4",
    specs: [
      { icon: "king_bed", label: "1" },
      { icon: "bathtub", label: "1" },
      { icon: "waves", label: "Río" },
    ],
  },
  {
    id: "mu-3",
    title: "Refugio Aquismón",
    location: "Cerca del Sótano de las Golondrinas",
    price: "$2,200,000",
    priceSuffix: "MXN",
    type: "VENTA",
    category: "Ecolodge",
    description:
      "Refugio ecológico entre selva y niebla, a minutos del Sótano de las Golondrinas. Perfecto para un negocio de turismo de naturaleza.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuARQWC19e7mleUpjb8CWLztEv_svJeRFOaC2i-9r9GctFuX5Barzhfai9wNM1WW8bcGlqdFM32d3KPf7SItom5ijdHOz5rGGQPeT7PlWs8-y9LkfcsHLQqsLxalhxP94XJo76_mAMp7T2dVj3hPKHNzTDLLiS6ujSdSsyo3onxQthp4ZkVE8op92gyTLUUucaGaxO8vJvyhH3HuWB07EPqT1WsW0lr9Of5lUPonjG9eiqE1XiJXTqzXUZQt5JorfPwCO1MioZA_Zro",
    specs: [
      { icon: "king_bed", label: "2" },
      { icon: "local_fire_department", label: "Chimenea" },
      { icon: "terrain", label: "Selva" },
    ],
  },
  {
    id: "mu-4",
    title: "Glamping Tamul Luxury",
    location: "Ruta Cascada de Tamul",
    price: "$5,200",
    priceSuffix: "/noche",
    type: "RENTA",
    category: "Glamping",
    description:
      "Tienda de lujo sobre plataforma de madera, en la ruta a la Cascada de Tamul, con desayuno incluido y guía opcional.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBGq4Phm0uDzCnjHAsnWpYTBVpOds_M6iOsJuRQQA5eUZHkztGgtc7eh_OE6wBeyW1-iZh7yyhROnvvmqkAZ9tyAWFGXk0FG52zU4kZ_EDLA0U0cRszy7byNXTeWe0_hS53SYmtCTEV8Y1AM-WxiIC38UMa15QwFDjXtCGQOxoh35K0Ol_70vfsxm0VqDbaWkr8tcEbLTLy0NXH_GcpGK4lAXizgxYOIlFWGyau-4OIfPZRpjCBDbz_qu3VlN201UUJGiuM9ajVd-U",
    specs: [
      { icon: "king_bed", label: "1" },
      { icon: "star", label: "VIP" },
      { icon: "wb_sunny", label: "Terraza" },
    ],
  },
  {
    id: "mu-5",
    title: "Estudio Centro Valles",
    location: "Zona Centro, Cd. Valles",
    price: "$1,850,000",
    priceSuffix: "MXN",
    type: "VENTA",
    category: "Departamento",
    description:
      "Estudio moderno a pasos de la zona comercial del Centro de Ciudad Valles, ideal como primera propiedad o inversión en renta.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA1w-Hb1289NqZKon3VK8bpmMiCDYYiAMT5egzTINo9m9wSZRHv-k-1IGTVoL1NT8YeZXJHa87JPNDIPrtrbP7jChHq0ypXF90uByhC6VA9O788_B4FY8JVg4chbWN9bcrn9-9FvVvfZX8Aj60Iqg_C8CsCA9DEnJqi2rJvzmK5UP5z-9XRTRjBneAPCa8iGgGWBD9yYKsziN6vn0ePBDGo3inieQtmbr46W31p6UfQ649XRxTm7ygOY2J-jxW1r0qWs8i97KGpkTE",
    specs: [
      { icon: "king_bed", label: "1" },
      { icon: "bathtub", label: "1" },
      { icon: "apartment", label: "Urbano" },
    ],
  },
  {
    id: "mu-6",
    title: "Quinta Las Palmas",
    location: "Carretera Nacional, Cd. Valles",
    price: "$4,200",
    priceSuffix: "/noche",
    type: "RENTA",
    category: "Villa",
    description:
      "Quinta con jardín tropical y alberca, disponible para renta vacacional o eventos familiares sobre la Carretera Nacional.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCfGXdY0g51ojSg0GMeTW9ndLY3mpKK3oMtWxo2nwd_dwi1pgn1Boi_ovaDGIFhUA7nwu3WdBch8ZuHxoHu3QfgM5ceAsp8pglRVyCROWNcy9zeDNP2wqLoevyKGcaEyFYHYpIx2KK46nLWthnHiHugmkKw48kJsL8IjMO1bL3T1Zwt8bvQDTTUHTgB3GqZ2RU2asRzF1jVg0rLw3LWXXTq0YF1CsbhlWpYOuCEpH5bB8zkBlbKXR4At_M46AL8rJqn5c6BrPD5PP8",
    specs: [
      { icon: "king_bed", label: "2" },
      { icon: "bathtub", label: "2" },
      { icon: "grass", label: "Jardín" },
    ],
  },
  {
    id: "mu-7",
    title: "Casa del Huapango",
    location: "Centro, Xilitla",
    price: "$2,850,000",
    priceSuffix: "MXN",
    type: "VENTA",
    category: "Casa",
    description:
      "Casa de estilo colonial en el centro histórico de Xilitla, a pasos de la plaza principal y el convento de San Agustín.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCra-FKp81t0_OM8bWD55m2o9OOSnR_v7D0UilyExMImxyIcr9tIMZ2Py3HcC0ra_MtSsBkduMcwxUNKI9_iSXFFr_YRON1SF9hNM3fcYy-uG7N7uusL0Z367WINi1V7_GwfNQx-gsbUqLtzVi4ivFyqFQGb4qBs79bALeSFb6i3_ZnJnI1VVrN-VeZYHjfYyQI5C6zy90N3uxWZpwzIBhNoUDKKQjQ8EOEYPoyPTzhnh6b6AS3dkkFJ8t4xSDC6qjhMrQUoUPnAeM",
    specs: [
      { icon: "king_bed", label: "3" },
      { icon: "bathtub", label: "2" },
      { icon: "home", label: "Casa" },
    ],
  },
  {
    id: "mu-8",
    title: "Cabaña Los Pozos",
    location: "Pozas, Xilitla",
    price: "$1,800",
    priceSuffix: "/noche",
    type: "RENTA",
    category: "Cabaña",
    description:
      "Cabaña rústica entre la selva de Xilitla, con balcón privado y acceso directo a las pozas naturales cercanas.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDurAGHzg_fpQxFal-obkFVy1Q3WLPdueAQpz0itcQiRV-WfvulnBEDJbNeV8J06q4mX7PTtXYVJjX4-mHVr_khZLZxQ_s8f6fruGqzeqALyMu8wEHRK1EsOs9f4_jPmS7FxcdzrDkR88Wz0GjaPLXkTZRoJQfur59rxYRLi-WYcW-VU_gKS39CPLOMlftvqGvW0IOk5tXgst5mJ4WQM-ICN4vkdel9ido9YFUQga0OI10i6NSe5W4owt33-2YRi_b_ltdZW2QZC5s",
    specs: [
      { icon: "king_bed", label: "2" },
      { icon: "forest", label: "Selva" },
      { icon: "wb_sunny", label: "Balcón" },
    ],
  },
  {
    id: "mu-9",
    title: "Terreno Vista Verde",
    location: "Axtla de Terrazas",
    price: "$950,000",
    priceSuffix: "MXN",
    type: "VENTA",
    category: "Terreno",
    description:
      "Terreno plano con vista abierta a la sierra, listo para construir, en zona de crecimiento de Axtla de Terrazas.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBGq4Phm0uDzCnjHAsnWpYTBVpOds_M6iOsJuRQQA5eUZHkztGgtc7eh_OE6wBeyW1-iZh7yyhROnvvmqkAZ9tyAWFGXk0FG52zU4kZ_EDLA0U0cRszy7byNXTeWe0_hS53SYmtCTEV8Y1AM-WxiIC38UMa15QwFDjXtCGQOxoh35K0Ol_70vfsxm0VqDbaWkr8tcEbLTLy0NXH_GcpGK4lAXizgxYOIlFWGyau-4OIfPZRpjCBDbz_qu3VlN201UUJGiuM9ajVd-U",
    specs: [
      { icon: "terrain", label: "Terreno" },
      { icon: "square_foot", label: "1200m²" },
      { icon: "eco", label: "Naturaleza" },
    ],
  },
  {
    id: "mu-10",
    title: "Departamento Potosino",
    location: "Lomas, Cd. Valles",
    price: "$6,500",
    priceSuffix: "/mes",
    type: "RENTA",
    category: "Departamento",
    description:
      "Departamento amueblado en Lomas, listo para habitar, con seguridad privada y cercanía a escuelas y plazas comerciales.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB4zNatD3vePhIZAi6OHHJKmamYSgeBNSKjEt32tvkkf4s6aBXCF8R4LNfDfPa9leA0t6N1OKOcP358WwZrnosbCBxSM7EaY2_P7qkx3MinRgmHQn7RvleNTwy8cLigMoR3iv0u83chBVbZYI6BcNMcqv80W-l1pIUgIWZcDIXEqtUatrsojSGfM0lTNDZpkBntBUkRY6NB4ZUymYNYvTHXKbO8NZ6N6uoyuuHqcaRWKzHCNXkOR3p-_EVFAHR8QwijIY_m1mefPZ4",
    specs: [
      { icon: "king_bed", label: "2" },
      { icon: "bathtub", label: "1" },
      { icon: "apartment", label: "Depa" },
    ],
  },
  {
    id: "mu-11",
    title: "Finca El Suspiro",
    location: "Tambaque, Aquismón",
    price: "$5,100,000",
    priceSuffix: "MXN",
    type: "VENTA",
    category: "Villa",
    description:
      "Finca productiva con casa principal, alberca y huerta propia, en la zona de Tambaque, Aquismón.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuARQWC19e7mleUpjb8CWLztEv_svJeRFOaC2i-9r9GctFuX5Barzhfai9wNM1WW8bcGlqdFM32d3KPf7SItom5ijdHOz5rGGQPeT7PlWs8-y9LkfcsHLQqsLxalhxP94XJo76_mAMp7T2dVj3hPKHNzTDLLiS6ujSdSsyo3onxQthp4ZkVE8op92gyTLUUucaGaxO8vJvyhH3HuWB07EPqT1WsW0lr9Of5lUPonjG9eiqE1XiJXTqzXUZQt5JorfPwCO1MioZA_Zro",
    specs: [
      { icon: "king_bed", label: "4" },
      { icon: "bathtub", label: "3" },
      { icon: "pool", label: "Alberca" },
    ],
  },
  {
    id: "mu-12",
    title: "Bungalow Tamasopo",
    location: "Cascadas Tamasopo",
    price: "$2,200",
    priceSuffix: "/noche",
    type: "RENTA",
    category: "Cabaña",
    description:
      "Bungalow frente a las cascadas de Tamasopo, con asador propio y acceso peatonal a las pozas turquesa.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDuQ9M7U6euA6_cXmYuXnej-N5IuawAW8ds-4G1mzfqmiBc13qXsPhf9_j_zTB8gfEunrBHo8xMsxYwCw_pl8fsxbxRkmyvLR1N9Tiye5ZJG7fwlLn9MwyBanXYhE0emGwp59es1FEyQTRQbmXLUKO74Yj34ZHqrqIkOtMKhP8CmRFvfoHT5LAe10105vUhKNkxIBvtt530nfLigSUTemOOcJMVNmsgactntRJUwOBU_TZzND7BYtDklr8uZcNYlQOK5U74-ufIf-E",
    specs: [
      { icon: "king_bed", label: "1" },
      { icon: "bathtub", label: "1" },
      { icon: "waves", label: "Río" },
    ],
  },
  {
    id: "mu-13",
    title: "Casa Mágica",
    location: "Centro Histórico, Xilitla",
    price: "$3,200,000",
    priceSuffix: "MXN",
    type: "VENTA",
    category: "Casa",
    description:
      "Casa colonial remodelada en el centro histórico de Xilitla, con terraza panorámica hacia la sierra.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA1w-Hb1289NqZKon3VK8bpmMiCDYYiAMT5egzTINo9m9wSZRHv-k-1IGTVoL1NT8YeZXJHa87JPNDIPrtrbP7jChHq0ypXF90uByhC6VA9O788_B4FY8JVg4chbWN9bcrn9-9FvVvfZX8Aj60Iqg_C8CsCA9DEnJqi2rJvzmK5UP5z-9XRTRjBneAPCa8iGgGWBD9yYKsziN6vn0ePBDGo3inieQtmbr46W31p6UfQ649XRxTm7ygOY2J-jxW1r0qWs8i97KGpkTE",
    specs: [
      { icon: "king_bed", label: "3" },
      { icon: "history_edu", label: "Colonial" },
      { icon: "wb_sunny", label: "Terraza" },
    ],
  },
  {
    id: "mu-14",
    title: "Cabaña Río Claro",
    location: "Minas Viejas, El Naranjo",
    price: "$2,800",
    priceSuffix: "/noche",
    type: "RENTA",
    category: "Cabaña",
    description:
      "Cabaña junto al río Minas Viejas, con asador y vista a la cascada, ideal para grupos pequeños.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCfGXdY0g51ojSg0GMeTW9ndLY3mpKK3oMtWxo2nwd_dwi1pgn1Boi_ovaDGIFhUA7nwu3WdBch8ZuHxoHu3QfgM5ceAsp8pglRVyCROWNcy9zeDNP2wqLoevyKGcaEyFYHYpIx2KK46nLWthnHiHugmkKw48kJsL8IjMO1bL3T1Zwt8bvQDTTUHTgB3GqZ2RU2asRzF1jVg0rLw3LWXXTq0YF1CsbhlWpYOuCEpH5bB8zkBlbKXR4At_M46AL8rJqn5c6BrPD5PP8",
    specs: [
      { icon: "king_bed", label: "2" },
      { icon: "waves", label: "Cascada" },
      { icon: "local_fire_department", label: "Asador" },
    ],
  },
  {
    id: "mu-15",
    title: "Terreno Cascada",
    location: "Pago Pago, Micos",
    price: "$1,250,000",
    priceSuffix: "MXN",
    type: "VENTA",
    category: "Terreno",
    description:
      "Terreno con acceso a río propio en la zona de Pago Pago, Micos, ideal para desarrollo turístico o casa de descanso.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBGq4Phm0uDzCnjHAsnWpYTBVpOds_M6iOsJuRQQA5eUZHkztGgtc7eh_OE6wBeyW1-iZh7yyhROnvvmqkAZ9tyAWFGXk0FG52zU4kZ_EDLA0U0cRszy7byNXTeWe0_hS53SYmtCTEV8Y1AM-WxiIC38UMa15QwFDjXtCGQOxoh35K0Ol_70vfsxm0VqDbaWkr8tcEbLTLy0NXH_GcpGK4lAXizgxYOIlFWGyau-4OIfPZRpjCBDbz_qu3VlN201UUJGiuM9ajVd-U",
    specs: [
      { icon: "terrain", label: "Terreno" },
      { icon: "square_foot", label: "2500m²" },
      { icon: "waves", label: "Río" },
    ],
  },
  {
    id: "mu-16",
    title: "Villa Huasteca",
    location: "Residencial, Cd. Valles",
    price: "$8,500",
    priceSuffix: "/mes",
    type: "RENTA",
    category: "Villa",
    description:
      "Villa residencial en renta mensual con alberca y jardín, en zona privada y segura de Ciudad Valles.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCra-FKp81t0_OM8bWD55m2o9OOSnR_v7D0UilyExMImxyIcr9tIMZ2Py3HcC0ra_MtSsBkduMcwxUNKI9_iSXFFr_YRON1SF9hNM3fcYy-uG7N7uusL0Z367WINi1V7_GwfNQx-gsbUqLtzVi4ivFyqFQGb4qBs79bALeSFb6i3_ZnJnI1VVrN-VeZYHjfYyQI5C6zy90N3uxWZpwzIBhNoUDKKQjQ8EOEYPoyPTzhnh6b6AS3dkkFJ8t4xSDC6qjhMrQUoUPnAeM",
    specs: [
      { icon: "king_bed", label: "3" },
      { icon: "bathtub", label: "2" },
      { icon: "pool", label: "Alberca" },
    ],
  },
];

export const allProperties: Property[] = [...featuredCollections, ...marketUpdates];

export function getPropertyById(id: string): Property | undefined {
  return allProperties.find((p) => p.id === id);
}
