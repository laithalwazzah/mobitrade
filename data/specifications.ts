import type { ProductIdentity } from "@/lib/productKey";

export const UNAVAILABLE_SPEC = "غير متوفر";

export type SpecificationSource = {
  label: string;
  url: string;
  type: "official" | "technical";
};

export type ProductSpecifications = {
  display: string;
  processor: string;
  ram: string;
  storage: string;
  cameras: string;
  battery: string;
  charging: string;
  network: string;
  os: string;
  dimensions: string;
  weight: string;
  releaseYear: string;
};

type HardwareSpecifications = Omit<ProductSpecifications, "storage"> & {
  ramByStorage?: Readonly<Record<string, string>>;
  sources: readonly SpecificationSource[];
};

export const specificationFields: { key: keyof ProductSpecifications; label: string }[] = [
  { key: "display", label: "الشاشة" },
  { key: "processor", label: "المعالج" },
  { key: "ram", label: "الذاكرة (RAM)" },
  { key: "storage", label: "التخزين" },
  { key: "cameras", label: "الكاميرات" },
  { key: "battery", label: "البطارية" },
  { key: "charging", label: "الشحن" },
  { key: "network", label: "الشبكة" },
  { key: "os", label: "نظام التشغيل" },
  { key: "dimensions", label: "الأبعاد" },
  { key: "weight", label: "الوزن" },
  { key: "releaseYear", label: "سنة الإصدار" },
];

type SpecificationIdentity = Pick<ProductIdentity, "brand" | "name" | "network">;

export function createSpecificationKey(identity: SpecificationIdentity) {
  if (!identity.network) return "";
  return [identity.brand, identity.name, identity.network]
    .map((part) => part.trim().toLocaleLowerCase("en-US").replace(/\s+/g, " "))
    .join("|");
}

const official = (label: string, url: string): SpecificationSource => ({ label, url, type: "official" });
const technical = (label: string, url: string): SpecificationSource => ({ label, url, type: "technical" });
const gsm = (slug: string) => technical("GSMArena", `https://www.gsmarena.com/${slug}.php`);
const key = (brand: string, name: string, network: "4G" | "5G") => createSpecificationKey({ brand, name, network });

const samsungNews = official("Samsung Newsroom", "https://news.samsung.com/id/galaxy-a15-series-mulai-2-jutaan-untuk-yang-pasti-performanya-dengan-super-amoled-dan-nfc");
const apple = (article: string) => official("Apple", `https://support.apple.com/en-us/${article}`);

export const specificationsByModelNetwork: Readonly<Record<string, HardwareSpecifications>> = {
  [key("Samsung", "Galaxy A32", "4G")]: {
    display: "6.4 بوصة Super AMOLED بدقة 1080 × 2400 وتردد 90Hz", processor: "MediaTek Helio G80", ram: "4GB أو 6GB أو 8GB بحسب السوق", cameras: "خلفية 64MP + 8MP + 5MP + 5MP، وأمامية 20MP", battery: "5000mAh", charging: "15W", network: "4G LTE", os: "Android 11 عند الإصدار", dimensions: "158.9 × 73.6 × 8.4 مم", weight: "184 غ", releaseYear: "2021",
    sources: [official("Samsung", "https://www.samsung.com/es/business/smartphones/galaxy-a/galaxy-a32-sm-a325fzkgeub/"), official("Samsung Newsroom", "https://news.samsung.com/in/samsung-launches-galaxy-a32-with-64mp-quad-camera-real-smooth-90hz-display-in-india"), gsm("samsung_galaxy_a32-10753")],
  },
  [key("Samsung", "Galaxy A15", "4G")]: {
    display: "6.5 بوصة Super AMOLED بدقة 1080 × 2340 وتردد 90Hz", processor: "MediaTek Helio G99", ram: "4GB أو 6GB أو 8GB بحسب السوق", cameras: "خلفية 50MP + 5MP + 2MP، وأمامية 13MP", battery: "5000mAh", charging: "25W", network: "4G LTE", os: "Android 14 عند الإصدار", dimensions: "160.1 × 76.8 × 8.4 مم", weight: "200 غ", releaseYear: "2023", sources: [samsungNews, gsm("samsung_galaxy_a15-12637")],
  },
  [key("Samsung", "Galaxy A15", "5G")]: {
    display: "6.5 بوصة Super AMOLED بدقة 1080 × 2340 وتردد 90Hz", processor: "MediaTek Dimensity 6100+", ram: "4GB أو 6GB أو 8GB بحسب السوق", cameras: "خلفية 50MP + 5MP + 2MP، وأمامية 13MP", battery: "5000mAh", charging: "25W", network: "5G", os: "Android 14 عند الإصدار", dimensions: "160.1 × 76.8 × 8.4 مم", weight: "200 غ", releaseYear: "2023", sources: [samsungNews, gsm("samsung_galaxy_a15_5g-12638")],
  },
  [key("Samsung", "Galaxy A25", "5G")]: {
    display: "6.5 بوصة Super AMOLED بدقة 1080 × 2340 وتردد 120Hz", processor: "Samsung Exynos 1280", ram: "6GB أو 8GB بحسب السوق", cameras: "خلفية 50MP + 8MP + 2MP، وأمامية 13MP", battery: "5000mAh", charging: "25W", network: "5G", os: "Android 14 عند الإصدار", dimensions: "161 × 76.5 × 8.3 مم", weight: "197 غ", releaseYear: "2023", sources: [official("Samsung", "https://image-us.samsung.com/SamsungUS/samsungbusiness/mobile/phones/galaxy-a/HHP449741_A25_5G_SpecSheet.pdf"), gsm("samsung_galaxy_a25-12555")],
  },
  [key("Samsung", "Galaxy A35", "5G")]: {
    display: "6.6 بوصة Super AMOLED بدقة 1080 × 2340 وتردد 120Hz", processor: "Samsung Exynos 1380", ram: "6GB أو 8GB أو 12GB بحسب السوق", cameras: "خلفية 50MP + 8MP + 5MP، وأمامية 13MP", battery: "5000mAh", charging: "25W", network: "5G", os: "Android 14 عند الإصدار", dimensions: "161.7 × 78 × 8.2 مم", weight: "209 غ", releaseYear: "2024", sources: [official("Samsung", "https://www.samsung.com/uk/smartphones/galaxy-a/galaxy-a35-5g-awesome-lemon-256gb-sm-a356bzygeub/"), gsm("samsung_galaxy_a35-12705")],
  },
  [key("Samsung", "Galaxy A55", "5G")]: {
    display: "6.6 بوصة Super AMOLED بدقة 1080 × 2340 وتردد 120Hz", processor: "Samsung Exynos 1480", ram: "8GB أو 12GB بحسب السوق", cameras: "خلفية 50MP + 12MP + 5MP، وأمامية 32MP", battery: "5000mAh", charging: "25W", network: "5G", os: "Android 14 عند الإصدار", dimensions: "161.1 × 77.4 × 8.2 مم", weight: "213 غ", releaseYear: "2024", sources: [official("Samsung", "https://www.samsung.com/uk/smartphones/galaxy-a/galaxy-a55-5g-awesome-navy-128gb-sm-a556bzkceub/"), technical("GSMArena review", "https://www.gsmarena.com/samsung_galaxy_a55-review-2684.php")],
  },
  [key("Samsung", "Galaxy S23 FE", "5G")]: {
    display: "6.4 بوصة Dynamic AMOLED 2X بدقة 1080 × 2340 وتردد 120Hz", processor: "Exynos 2200 أو Snapdragon 8 Gen 1 بحسب السوق", ram: "8GB", cameras: "خلفية 50MP + 8MP + 12MP، وأمامية 10MP", battery: "4500mAh", charging: "25W سلكي و15W لاسلكي", network: "5G", os: "Android 13 عند الإصدار", dimensions: "158 × 76.5 × 8.2 مم", weight: "209 غ", releaseYear: "2023", sources: [official("Samsung", "https://www.samsung.com/us/smartphones/galaxy-s23-fe/"), technical("GSMArena review", "https://www.gsmarena.com/samsung_galaxy_s23_fe-review-2636.php")],
  },
  [key("Samsung", "Galaxy S24", "5G")]: {
    display: "6.2 بوصة Dynamic LTPO AMOLED 2X بدقة 1080 × 2340 وتردد 1–120Hz", processor: "Exynos 2400 أو Snapdragon 8 Gen 3 بحسب السوق", ram: "8GB", cameras: "خلفية 50MP + 10MP + 12MP، وأمامية 12MP", battery: "4000mAh", charging: "25W سلكي و15W لاسلكي", network: "5G", os: "Android 14 عند الإصدار", dimensions: "147 × 70.6 × 7.6 مم", weight: "167 غ أو 168 غ بحسب النسخة", releaseYear: "2024", sources: [official("Samsung", "https://www.samsung.com/us/smartphones/galaxy-s24/"), technical("GSMArena review", "https://www.gsmarena.com/samsung_galaxy_s24-review-2663.php")],
  },
  [key("Samsung", "Galaxy S24 Ultra", "5G")]: {
    display: "6.8 بوصة Dynamic LTPO AMOLED 2X بدقة 1440 × 3120 وتردد 1–120Hz", processor: "Snapdragon 8 Gen 3 for Galaxy", ram: "12GB", cameras: "خلفية 200MP + 50MP + 10MP + 12MP، وأمامية 12MP", battery: "5000mAh", charging: "45W سلكي و15W لاسلكي", network: "5G", os: "Android 14 عند الإصدار", dimensions: "162.3 × 79 × 8.6 مم", weight: "232 غ", releaseYear: "2024", sources: [official("Samsung", "https://www.samsung.com/us/smartphones/galaxy-s24-ultra/"), technical("GSMArena review", "https://www.gsmarena.com/samsung_galaxy_s24_ultra-review-2670.php")],
  },
  [key("Samsung", "Galaxy M14", "4G")]: {
    display: "6.7 بوصة PLS LCD بدقة 1080 × 2400 وتردد 90Hz", processor: "Qualcomm Snapdragon 680 4G", ram: "4GB أو 6GB", ramByStorage: { "128GB": "6GB" }, cameras: "خلفية 50MP + 2MP + 2MP، وأمامية 13MP", battery: "5000mAh", charging: "25W", network: "4G LTE", os: "Android 13 عند الإصدار", dimensions: "168 × 77.8 × 8.8 مم", weight: "194 غ", releaseYear: "2024", sources: [gsm("samsung_galaxy_m14_4g-12862")],
  },
  [key("Samsung", "Galaxy M14", "5G")]: {
    display: "6.6 بوصة PLS LCD بدقة 1080 × 2408 وتردد 90Hz", processor: "Samsung Exynos 1330", ram: "4GB أو 6GB", cameras: "خلفية 50MP + 2MP + 2MP، وأمامية 13MP", battery: "6000mAh", charging: "15W أو 25W بحسب السوق", network: "5G", os: "Android 13 عند الإصدار", dimensions: "166.8 × 77.2 × 9.4 مم", weight: "206 غ", releaseYear: "2023", sources: [technical("GSMArena launch report", "https://www.gsmarena.com/samsung_galaxy_m14_5g_launches_in_india-news-58277.php"), gsm("samsung_galaxy_m14_5g-12160")],
  },
  [key("Xiaomi", "Redmi Note 13", "4G")]: {
    display: "6.67 بوصة AMOLED بدقة 1080 × 2400 وتردد 120Hz", processor: "Qualcomm Snapdragon 685", ram: "6GB أو 8GB", cameras: "خلفية 108MP + 8MP + 2MP، وأمامية 16MP", battery: "5000mAh", charging: "33W", network: "4G LTE", os: "Android 13 مع MIUI 14 عند الإصدار", dimensions: "162.3 × 75.6 × 8 مم", weight: "188.5 غ", releaseYear: "2024", sources: [official("Xiaomi", "https://www.mi.com/global/redmi-note-13/specs"), technical("GSMArena review", "https://www.gsmarena.com/xiaomi_redmi_note_13_4g-review-2666.php")],
  },
  [key("Xiaomi", "Redmi Note 13", "5G")]: {
    display: "6.67 بوصة AMOLED بدقة 1080 × 2400 وتردد 120Hz", processor: "MediaTek Dimensity 6080", ram: "6GB أو 8GB أو 12GB بحسب السوق", cameras: "خلفية 108MP + 8MP + 2MP، وأمامية 16MP", battery: "5000mAh", charging: "33W", network: "5G", os: "Android 13 عند الإصدار", dimensions: "161.1 × 75 × 7.6 مم", weight: "174.5 غ", releaseYear: "2023", sources: [official("Xiaomi", "https://www.mi.com/global/redmi-note-13-5g/specs"), technical("GSMArena review", "https://www.gsmarena.com/xiaomi_redmi_note_13_5g-review-2667.php")],
  },
  [key("Xiaomi", "Redmi Note 13 Pro", "4G")]: {
    display: "6.67 بوصة AMOLED بدقة 1080 × 2400 وتردد 120Hz", processor: "MediaTek Helio G99 Ultra", ram: "8GB أو 12GB", cameras: "خلفية 200MP + 8MP + 2MP، وأمامية 16MP", battery: "5000mAh", charging: "67W", network: "4G LTE", os: "Android 13 عند الإصدار", dimensions: "161.1 × 75 × 8 مم", weight: "188 غ", releaseYear: "2024", sources: [official("Xiaomi", "https://www.mi.com/global/redmi-note-13-pro/specs"), technical("GSMArena review", "https://www.gsmarena.com/xiaomi_redmi_note_13_pro_4g-review-2657.php")],
  },
  [key("Xiaomi", "Redmi Note 13 Pro", "5G")]: {
    display: "6.67 بوصة AMOLED بدقة 1220 × 2712 وتردد 120Hz", processor: "Qualcomm Snapdragon 7s Gen 2", ram: "8GB أو 12GB أو 16GB بحسب السوق", cameras: "خلفية 200MP + 8MP + 2MP، وأمامية 16MP", battery: "5100mAh", charging: "67W", network: "5G", os: "Android 13 عند الإصدار", dimensions: "161.2 × 74.2 × 8 مم", weight: "187 غ", releaseYear: "2023", sources: [official("Xiaomi", "https://www.mi.com/global/redmi-note-13-pro-5g/specs"), technical("GSMArena review", "https://www.gsmarena.com/xiaomi_redmi_note_13_pro_5g-review-2660.php")],
  },
  [key("Xiaomi", "Redmi 13C", "4G")]: {
    display: "6.74 بوصة IPS LCD بدقة 720 × 1600 وتردد 90Hz", processor: "MediaTek Helio G85", ram: "4GB أو 6GB أو 8GB بحسب السوق", cameras: "خلفية 50MP + 2MP + عدسة مساعدة، وأمامية 8MP", battery: "5000mAh", charging: "18W", network: "4G LTE", os: "Android 13 عند الإصدار", dimensions: "168 × 78 × 8.1 مم", weight: "192 غ", releaseYear: "2023", sources: [official("Xiaomi", "https://www.mi.com/global/product/redmi-13c/specs"), gsm("xiaomi_redmi_13c-12689")],
  },
  [key("Xiaomi", "Redmi 12", "4G")]: {
    display: "6.79 بوصة IPS LCD بدقة 1080 × 2460 وتردد 90Hz", processor: "MediaTek Helio G88", ram: "4GB أو 8GB بحسب السوق", cameras: "خلفية 50MP + 8MP + 2MP، وأمامية 8MP", battery: "5000mAh", charging: "18W", network: "4G LTE", os: "Android 13 عند الإصدار", dimensions: "168.6 × 76.3 × 8.2 مم", weight: "198.5 غ", releaseYear: "2023", sources: [official("Xiaomi", "https://www.mi.com/global/product/redmi-12/specs"), gsm("xiaomi_redmi_12-12328")],
  },
  [key("Poco", "X6 Pro", "5G")]: {
    display: "6.67 بوصة AMOLED بدقة 1220 × 2712 وتردد 120Hz", processor: "MediaTek Dimensity 8300 Ultra", ram: "8GB أو 12GB", cameras: "خلفية 64MP + 8MP + 2MP، وأمامية 16MP", battery: "5000mAh", charging: "67W", network: "5G", os: "Android 14 مع HyperOS عند الإصدار", dimensions: "160.5 × 74.3 × 8.3 مم", weight: "186 غ", releaseYear: "2024", sources: [official("Poco", "https://www.po.co/global/product/poco-x6-pro/specs/"), technical("GSMArena review", "https://www.gsmarena.com/poco_x6_pro-review-2653.php")],
  },
  [key("Poco", "C65", "4G")]: {
    display: "6.74 بوصة IPS LCD بدقة 720 × 1600 وتردد 90Hz", processor: "MediaTek Helio G85", ram: "4GB أو 6GB أو 8GB بحسب السوق", cameras: "خلفية 50MP + 2MP + عدسة مساعدة، وأمامية 8MP", battery: "5000mAh", charging: "18W", network: "4G LTE", os: "Android 13 عند الإصدار", dimensions: "168 × 78 × 8.1 مم", weight: "192 غ", releaseYear: "2023", sources: [official("Poco", "https://www.po.co/global/product/poco-c65/specs/"), gsm("xiaomi_poco_c65-12684")],
  },
  [key("Apple", "iPhone 11", "4G")]: {
    display: "6.1 بوصة Liquid Retina HD LCD بدقة 1792 × 828", processor: "Apple A13 Bionic", ram: "4GB", cameras: "خلفية 12MP واسعة + 12MP فائقة الاتساع، وأمامية 12MP", battery: "3110mAh", charging: "شحن سريع حتى 50% خلال 30 دقيقة بمحوّل 20W أو أعلى، وشحن Qi لاسلكي", network: "4G LTE", os: "iOS 13 عند الإصدار", dimensions: "150.9 × 75.7 × 8.3 مم", weight: "194 غ", releaseYear: "2019", sources: [official("Apple", "https://support.apple.com/en-za/111865"), gsm("apple_iphone_11-9848")],
  },
  [key("Apple", "iPhone 12", "5G")]: {
    display: "6.1 بوصة Super Retina XDR OLED بدقة 2532 × 1170", processor: "Apple A14 Bionic", ram: "4GB", cameras: "خلفية 12MP واسعة + 12MP فائقة الاتساع، وأمامية 12MP", battery: "2815mAh", charging: "20W سلكي، وMagSafe حتى 15W، وQi حتى 7.5W", network: "5G", os: "iOS 14 عند الإصدار", dimensions: "146.7 × 71.5 × 7.4 مم", weight: "164 غ", releaseYear: "2020", sources: [apple("111876"), gsm("apple_iphone_12-10509")],
  },
  [key("Apple", "iPhone 13", "5G")]: {
    display: "6.1 بوصة Super Retina XDR OLED بدقة 2532 × 1170", processor: "Apple A15 Bionic", ram: "4GB", cameras: "خلفية 12MP واسعة + 12MP فائقة الاتساع، وأمامية 12MP", battery: "3240mAh", charging: "20W سلكي، وMagSafe حتى 15W، وQi حتى 7.5W", network: "5G", os: "iOS 15 عند الإصدار", dimensions: "146.7 × 71.5 × 7.65 مم", weight: "174 غ", releaseYear: "2021", sources: [apple("111872"), gsm("apple_iphone_13-11103")],
  },
  [key("Apple", "iPhone 14", "5G")]: {
    display: "6.1 بوصة Super Retina XDR OLED بدقة 2532 × 1170", processor: "Apple A15 Bionic بمعالج رسومي خماسي النواة", ram: "6GB", cameras: "خلفية 12MP واسعة + 12MP فائقة الاتساع، وأمامية 12MP", battery: "3279mAh", charging: "20W سلكي، وMagSafe حتى 15W، وQi حتى 7.5W", network: "5G", os: "iOS 16 عند الإصدار", dimensions: "146.7 × 71.5 × 7.8 مم", weight: "172 غ", releaseYear: "2022", sources: [apple("111850"), gsm("apple_iphone_14-11861")],
  },
  [key("Apple", "iPhone 15", "5G")]: {
    display: "6.1 بوصة Super Retina XDR OLED بدقة 2556 × 1179", processor: "Apple A16 Bionic", ram: "6GB", cameras: "خلفية 48MP رئيسية + 12MP فائقة الاتساع، وأمامية 12MP", battery: "3349mAh", charging: "20W سلكي، وMagSafe حتى 15W، وQi2 حتى 15W", network: "5G", os: "iOS 17 عند الإصدار", dimensions: "147.6 × 71.6 × 7.8 مم", weight: "171 غ", releaseYear: "2023", sources: [apple("111831"), gsm("apple_iphone_15-12559")],
  },
  [key("Infinix", "Hot 40", "4G")]: {
    display: "6.78 بوصة IPS LCD بدقة 1080 × 2460 وتردد 90Hz", processor: "MediaTek Helio G88", ram: "8GB", cameras: "خلفية 50MP + 2MP + عدسة مساعدة، وأمامية 32MP", battery: "5000mAh", charging: "33W", network: "4G LTE", os: "Android 13 مع XOS 13.5 عند الإصدار", dimensions: "168.6 × 76.6 × 8.3 مم", weight: "196 غ", releaseYear: "2023", sources: [official("Infinix", "https://www.infinixmobility.com/hot-40"), gsm("infinix_hot_40-12732")],
  },
  [key("Infinix", "Note 40", "4G")]: {
    display: "6.78 بوصة AMOLED بدقة 1080 × 2436 وتردد 120Hz", processor: "MediaTek Helio G99 Ultimate", ram: "8GB", cameras: "خلفية 108MP + 2MP + 2MP، وأمامية 32MP", battery: "5000mAh", charging: "45W سلكي و20W لاسلكي", network: "4G LTE", os: "Android 14 مع XOS 14 عند الإصدار", dimensions: "164.1 × 74.5 × 7.8 مم", weight: "190 غ", releaseYear: "2024", sources: [official("Infinix", "https://www.infinixmobility.com/note-40"), technical("GSMArena announcement", "https://www.gsmarena.com/infinix_note_40_series_announced_with_curved_oled_displays_108mp_cameras-news-62048.php"), gsm("infinix_note_40-12877")],
  },
  [key("Tecno", "Spark 20", "4G")]: {
    display: "6.6 بوصة IPS LCD بدقة 720 × 1612 وتردد 90Hz", processor: "MediaTek Helio G85", ram: "8GB", cameras: "خلفية 50MP + عدسة مساعدة، وأمامية 32MP", battery: "5000mAh", charging: "18W", network: "4G LTE", os: "Android 13 عند الإصدار", dimensions: "163.7 × 75.6 × 8.5 مم", weight: UNAVAILABLE_SPEC, releaseYear: "2023", sources: [official("Tecno", "https://www.tecno-mobile.com/phones/product-detail/product/spark-20/"), technical("GSMArena announcement", "https://www.gsmarena.com/tecno_spark_20_silently_unveiled-news-60782.php"), gsm("tecno_spark_20-12722")],
  },
  [key("Tecno", "Camon 30", "4G")]: {
    display: "6.78 بوصة AMOLED بدقة 1080 × 2436 وتردد 120Hz", processor: "MediaTek Helio G99 Ultimate", ram: "8GB أو 12GB", cameras: "خلفية 50MP + 2MP + عدسة مساعدة، وأمامية 50MP", battery: "5000mAh", charging: "70W", network: "4G LTE", os: "Android 14 عند الإصدار", dimensions: "165.3 × 75.3 × 7.7 مم", weight: UNAVAILABLE_SPEC, releaseYear: "2024", sources: [official("Tecno", "https://www.tecno-mobile.com/phones/product-detail/product/camon-30/"), gsm("tecno_camon_30-12848")],
  },
  [key("Realme", "C55", "4G")]: {
    display: "6.72 بوصة LCD بدقة 1080 × 2400 وتردد 90Hz", processor: "MediaTek Helio G88", ram: "6GB أو 8GB بحسب السوق", cameras: "خلفية 64MP + عدسة مساعدة، وأمامية 8MP", battery: "5000mAh", charging: "33W SUPERVOOC", network: "4G LTE", os: "Android 13 مع realme UI 4.0 عند الإصدار", dimensions: "165.6 × 75.9 × 7.89 مم", weight: "189.5 غ", releaseYear: "2023", sources: [official("Realme", "https://www.realme.com/es/realme-c55/specs"), gsm("realme_c55-12159")],
  },
  [key("Honor", "X8b", "4G")]: {
    display: "6.7 بوصة AMOLED بدقة 1080 × 2412 وتردد 90Hz", processor: "Qualcomm Snapdragon 680 4G", ram: "6GB أو 8GB بحسب السعة والسوق", cameras: "خلفية 108MP + 5MP + 2MP، وأمامية 50MP", battery: "4500mAh", charging: "35W", network: "4G LTE", os: "Android 13 عند الإصدار", dimensions: "161.1 × 74.6 × 6.8 مم", weight: "166 غ", releaseYear: "2023", sources: [official("Honor", "https://www.honor.com/global/phones/honor-x8b/"), gsm("honor_x8b-12748")],
  },
  [key("Oppo", "A58", "4G")]: {
    display: "6.72 بوصة IPS LCD بدقة 1080 × 2400", processor: "MediaTek Helio G85", ram: "6GB أو 8GB بحسب السوق", cameras: "خلفية 50MP + 2MP، وأمامية 8MP", battery: "5000mAh", charging: "33W SUPERVOOC", network: "4G LTE", os: "Android 13 عند الإصدار", dimensions: "165.7 × 76 × 8 مم", weight: "192 غ", releaseYear: "2023", sources: [official("Oppo", "https://www.oppo.com/en/smartphones/series-a/a58/specs/"), gsm("oppo_a58_4g-12436")],
  },
};

export function getProductSpecifications(product: ProductIdentity) {
  return specificationsByModelNetwork[createSpecificationKey(product)];
}

export function getSpecificationsOrUnavailable(product: ProductIdentity): ProductSpecifications {
  const specifications = getProductSpecifications(product);
  if (!specifications) {
    return Object.fromEntries(
      specificationFields.map(({ key: field }) => [field, field === "storage" ? product.storage || UNAVAILABLE_SPEC : UNAVAILABLE_SPEC]),
    ) as ProductSpecifications;
  }

  return {
    display: specifications.display,
    processor: specifications.processor,
    ram: specifications.ramByStorage?.[product.storage] ?? specifications.ram,
    storage: product.storage || UNAVAILABLE_SPEC,
    cameras: specifications.cameras,
    battery: specifications.battery,
    charging: specifications.charging,
    network: specifications.network,
    os: specifications.os,
    dimensions: specifications.dimensions,
    weight: specifications.weight,
    releaseYear: specifications.releaseYear,
  };
}
