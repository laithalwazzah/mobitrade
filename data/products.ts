export type OfferCondition = "new" | "used";

export type Offer = {
  shopId: string;
  price: number;
  currency: "USD" | "SYP";
  updatedAt: string; // بصيغة "2026-10-27"
  condition: OfferCondition;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  storage: string;
  network?: "4G" | "5G";
  offers: Offer[];
};

export type Shop = {
  id: string;
  name: string;
  area: string;
  address: string;
  whatsapp: string; // بصيغة دولية بدون + مثل 963912345678
};

export const shops: Shop[] = [
  {
    id: "shop1",
    name: "اسم المحل الأول",
    area: "اللاذقية - اسم الحي",
    address: "العنوان التفصيلي",
    whatsapp: "963000000000",
  },
  {
    id: "shop2",
    name: "اسم المحل الثاني",
    area: "اللاذقية - اسم الحي",
    address: "العنوان التفصيلي",
    whatsapp: "963000000001",
  },
  {
    id: "shop3",
    name: "HDO",
    area: "اللاذقية - الزراعة",
    address: "الزراعة، جانب سور السكن",
    whatsapp: "963937272727",
  },
  // TEST DATA - remove before publishing
  {
    id: "shop4",
    name: "غلطان بالنمرة",
    area: "اللاذقية - سبيرو",
    address: "مفرق سبيرو",
    whatsapp: "963936354895",
  },
  {
    id: "shop5",
    name: "Saintra",
    area: "اللاذقية - 8 آذار",
    address: "8 آذار، بناية LG",
    whatsapp: "963935847956",
  },
];

export const products: Product[] = [
  {
    id: "p1",
    name: "اسم الموديل (تجريبي)",
    brand: "الشركة",
    storage: "128GB",
    offers: [
      {
        shopId: "shop1",
        price: 250,
        currency: "USD",
        updatedAt: "2026-10-27",
        condition: "new",
      },
      {
        shopId: "shop2",
        price: 245,
        currency: "USD",
        updatedAt: "2026-10-25",
        condition: "new",
      },
    ],
  },
  {
    id: "p2",
    name: "Galaxy A32",
    brand: "Samsung",
    storage: "128GB",
    network: "4G",
    offers: [
      {
        shopId: "shop3",
        price: 230,
        currency: "USD",
        updatedAt: "2026-10-28",
        condition: "new",
      },
      // TEST DATA - remove before publishing
      {
        shopId: "shop4",
        price: 220,
        currency: "USD",
        condition: "new",
        updatedAt: "2026-10-28",
      },
    ],
  },
  {
    id: "p3",
    name: "iPhone 11",
    brand: "Apple",
    storage: "128GB",
    network: "4G",
    offers: [
      {
        shopId: "shop5",
        price: 250,
        currency: "USD",
        condition: "used",
        updatedAt: "2026-10-28",
      },
    ],
  },
];