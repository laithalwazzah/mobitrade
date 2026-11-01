export type OfferCondition = "new" | "used";

export type Offer = {
  shopId: string;
  price: number;
  currency: "USD" | "SYP";
  updatedAt: string; // بصيغة "2026-10-27"
  condition: OfferCondition;
  notes?: string;
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
    id: "shop3",
    name: "HDO",
    area: "اللاذقية - الزراعة",
    address: "الزراعة، جانب سور السكن",
    whatsapp: "963937272727",
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
