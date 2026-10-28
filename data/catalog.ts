export type CatalogModel = {
  id: string;
  brand: string;
  name: string;
  storages: string[];
  network: ("4G" | "5G")[];
};

export const catalog: CatalogModel[] = [
  {
    id: "samsung-a32",
    brand: "Samsung",
    name: "Galaxy A32",
    storages: ["128GB"],
    network: ["4G"],
  },
  {
    id: "samsung-a15",
    brand: "Samsung",
    name: "Galaxy A15",
    storages: ["128GB", "256GB"],
    network: ["4G", "5G"],
  },
  {
    id: "samsung-a25",
    brand: "Samsung",
    name: "Galaxy A25",
    storages: ["128GB", "256GB"],
    network: ["5G"],
  },
  {
    id: "samsung-a35",
    brand: "Samsung",
    name: "Galaxy A35",
    storages: ["128GB", "256GB"],
    network: ["5G"],
  },
  {
    id: "samsung-a55",
    brand: "Samsung",
    name: "Galaxy A55",
    storages: ["128GB", "256GB"],
    network: ["5G"],
  },
  {
    id: "samsung-s23-fe",
    brand: "Samsung",
    name: "Galaxy S23 FE",
    storages: ["128GB", "256GB"],
    network: ["5G"],
  },
  {
    id: "samsung-s24",
    brand: "Samsung",
    name: "Galaxy S24",
    storages: ["128GB", "256GB"],
    network: ["5G"],
  },
  {
    id: "samsung-s24-ultra",
    brand: "Samsung",
    name: "Galaxy S24 Ultra",
    storages: ["256GB", "512GB", "1TB"],
    network: ["5G"],
  },
  {
    id: "samsung-m14",
    brand: "Samsung",
    name: "Galaxy M14",
    storages: ["128GB"],
    network: ["4G", "5G"],
  },
  {
    id: "xiaomi-redmi-note-13",
    brand: "Xiaomi",
    name: "Redmi Note 13",
    storages: ["128GB", "256GB"],
    network: ["4G", "5G"],
  },
  {
    id: "xiaomi-redmi-note-13-pro",
    brand: "Xiaomi",
    name: "Redmi Note 13 Pro",
    storages: ["256GB", "512GB"],
    network: ["4G", "5G"],
  },
  {
    id: "xiaomi-redmi-13c",
    brand: "Xiaomi",
    name: "Redmi 13C",
    storages: ["128GB", "256GB"],
    network: ["4G"],
  },
  {
    id: "xiaomi-redmi-12",
    brand: "Xiaomi",
    name: "Redmi 12",
    storages: ["128GB", "256GB"],
    network: ["4G"],
  },
  {
    id: "poco-x6-pro",
    brand: "Poco",
    name: "X6 Pro",
    storages: ["256GB", "512GB"],
    network: ["5G"],
  },
  {
    id: "poco-c65",
    brand: "Poco",
    name: "C65",
    storages: ["128GB", "256GB"],
    network: ["4G"],
  },
  {
    id: "iphone-11",
    brand: "Apple",
    name: "iPhone 11",
    storages: ["64GB", "128GB", "256GB"],
    network: ["4G"],
  },
  {
    id: "iphone-12",
    brand: "Apple",
    name: "iPhone 12",
    storages: ["64GB", "128GB", "256GB"],
    network: ["5G"],
  },
  {
    id: "iphone-13",
    brand: "Apple",
    name: "iPhone 13",
    storages: ["128GB", "256GB", "512GB"],
    network: ["5G"],
  },
  {
    id: "iphone-14",
    brand: "Apple",
    name: "iPhone 14",
    storages: ["128GB", "256GB", "512GB"],
    network: ["5G"],
  },
  {
    id: "iphone-15",
    brand: "Apple",
    name: "iPhone 15",
    storages: ["128GB", "256GB", "512GB"],
    network: ["5G"],
  },
  {
    id: "infinix-hot-40",
    brand: "Infinix",
    name: "Hot 40",
    storages: ["128GB", "256GB"],
    network: ["4G"],
  },
  {
    id: "infinix-note-40",
    brand: "Infinix",
    name: "Note 40",
    storages: ["256GB"],
    network: ["4G"],
  },
  {
    id: "tecno-spark-20",
    brand: "Tecno",
    name: "Spark 20",
    storages: ["128GB", "256GB"],
    network: ["4G"],
  },
  {
    id: "tecno-camon-30",
    brand: "Tecno",
    name: "Camon 30",
    storages: ["256GB"],
    network: ["4G"],
  },
  {
    id: "realme-c55",
    brand: "Realme",
    name: "C55",
    storages: ["128GB", "256GB"],
    network: ["4G"],
  },
  {
    id: "honor-x8b",
    brand: "Honor",
    name: "X8b",
    storages: ["256GB"],
    network: ["4G"],
  },
  {
    id: "oppo-a58",
    brand: "Oppo",
    name: "A58",
    storages: ["128GB", "256GB"],
    network: ["4G"],
  },
];

export function getBrands() {
  return Array.from(new Set(catalog.map((model) => model.brand)));
}

export function getModelsByBrand(brand: string) {
  return catalog.filter((model) => model.brand === brand);
}
