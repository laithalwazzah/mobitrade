import { catalog } from "@/data/catalog";
import { createSpecificationKey } from "@/data/specifications";
import type { ProductIdentity } from "@/lib/productKey";

export type DeviceMedia = {
  brand: string;
  name: string;
  network: "4G" | "5G";
  path: string;
  alt: string;
  sourceUrl: string;
};

export type BrandMedia = {
  brand: string;
  path: string;
  alt: string;
  sourceUrl: string;
};

const deviceSources: Readonly<Record<string, string>> = {
  "samsung|galaxy a32|4g": "https://img.global.news.samsung.com/in/wp-content/uploads/2021/03/SM_A325_GalaxyA32_Awesome-Black_Front-L30.png",
  "samsung|galaxy a15|4g": "https://img.global.news.samsung.com/tw/wp-content/uploads/2023/12/A15-newsroom-A-1.png",
  "samsung|galaxy a15|5g": "https://img.global.news.samsung.com/tw/wp-content/uploads/2023/12/A15-newsroom-A-1.png",
  "samsung|galaxy a25|5g": "https://img.global.news.samsung.com/tw/wp-content/uploads/2023/12/A25-newsroom-A-1.png",
  "samsung|galaxy a35|5g": "https://img.kr.news.samsung.com/kr/wp-content/uploads/2024/06/%EC%82%BC%EC%84%B1%EC%A0%84%EC%9E%90-%EB%AA%A8%EB%B0%94%EC%9D%BC-%EA%B0%A4%EB%9F%AD%EC%8B%9C-%EA%B0%A4%EB%9F%AD%EC%8B%9C-A35-5G-%EC%B6%9C%EC%8B%9C-2-e1718779850889.jpg",
  "samsung|galaxy a55|5g": "https://img.global.news.samsung.com/jp/wp-content/uploads/2024/05/A55_k_all.png",
  "samsung|galaxy s23 fe|5g": "https://img.us.news.samsung.com/us/wp-content/uploads/2023/10/03144707/SM-S711_GalaxyS23FE_Front_Mint-scaled.jpg",
  "samsung|galaxy s24|5g": "https://images.samsung.com/is/image/samsung/assets/us/2501/pcd/smartphones/galaxy-s24/galaxy-S24-ft02-kv_DT.jpg?$1440_N_JPG$",
  "samsung|galaxy s24 ultra|5g": "https://images.samsung.com/is/image/samsung/assets/us/2501/pcd/smartphones/galaxy-s24-ultra/galaxy-S24-ultra-ft02-kv_DT.jpg?$1440_N_JPG$",
  "samsung|galaxy m14|4g": "https://images.samsung.com/is/image/samsung/p6pim/bd/sm-m145fdbjbck/gallery/bd-galaxy-m14-sm-m145fdbjbck-542182747?$624_624_PNG$",
  "samsung|galaxy m14|5g": "https://img.global.news.samsung.com/id/wp-content/uploads/2023/03/30075637/Galaxy-M14-5G_Blue.jpg",
  "xiaomi|redmi note 13|4g": "https://i02.appmifile.com/994_operatorx_operatorx_opx/11/01/2024/72a71b312950178179eeb71425ef8def.png",
  "xiaomi|redmi note 13|5g": "https://i02.appmifile.com/463_operatorx_operatorx_opx/11/01/2024/e02e51cd6efb5f2282e6921128b2618a.png",
  "xiaomi|redmi note 13 pro|4g": "https://i02.appmifile.com/13_operatorx_operatorx_opx/11/01/2024/25da829b5997ff8aea28af388df3b8df.png",
  "xiaomi|redmi note 13 pro|5g": "https://i02.appmifile.com/855_operatorx_operatorx_opx/11/01/2024/4fad3c8039e37a4fa97f8be0462e88e5.png",
  "xiaomi|redmi 13c|4g": "https://i02.appmifile.com/477_operatorx_operatorx_opx/08/11/2023/a69b2ced4a4e2403fbfd446994c26a06.png",
  "xiaomi|redmi 12|4g": "https://i02.appmifile.com/180_operatorx_operatorx_opx/15/06/2023/32cd73d5451f1a9b26d439b30f7cef7d.png",
  "poco|x6 pro|5g": "https://i02.appmifile.com/117_operator_sg/11/12/2023/9beac802a13acc28e63b66a240607bde.png",
  "poco|c65|4g": "https://i02.appmifile.com/675_operator_sg/30/10/2023/67a3261b0f208c62cdfa2cee876e6370.png",
  "apple|iphone 11|4g": "https://www.apple.com/newsroom/images/tile-images/Apple_iphone_11-rosette-family-lineup-091019.jpg.og.jpg",
  "apple|iphone 12|5g": "https://www.apple.com/newsroom/images/product/iphone/standard/apple_iphone-12_new-design_10132020.jpg.og.jpg",
  "apple|iphone 13|5g": "https://www.apple.com/newsroom/images/product/iphone/standard/Apple_iphone13_design_09142021.jpg.og.jpg",
  "apple|iphone 14|5g": "https://www.apple.com/newsroom/images/product/iphone/standard/Apple-iPhone-14-iPhone-14-Plus-hero-220907.jpg.og.jpg",
  "apple|iphone 15|5g": "https://www.apple.com/newsroom/images/2023/09/apple-debuts-iphone-15-and-iphone-15-plus/tile/Apple-iPhone-15-lineup-hero-230912.jpg.og.jpg",
  "infinix|hot 40|4g": "https://www.infinixmobility.com/newfileadmin/usp/hot-40/assets/pc/sec1/kv-pc.webp",
  "infinix|note 40|4g": "https://d3o31au25zfcly.cloudfront.net/newfileadmin/usp/note/note40/assets/frames/mb/sec1/kv_note40_1.webp",
  "tecno|spark 20|4g": "https://d13pvy8xd75yde.cloudfront.net/global/phones/74bba34d371cfe0a6fdc7e1bc7f6c009.webp",
  "tecno|camon 30|4g": "https://d13pvy8xd75yde.cloudfront.net/global/phones/camon/camon30/1.png",
  "realme|c55|4g": "https://static.realme.net/v2/realme-c55/images/specs/gold-917b134da5.jpg",
  "honor|x8b|4g": "https://www-file.honor.com/content/dam/honor/global/products/smartphone/honor-x8b/assets/x8b-share.jpg",
  "oppo|a58|4g": "https://www.oppo.com/content/dam/oppo/common/mkt/v2-2/a58-en/specs/a58.png",
};

function assetSlug(identity: Pick<DeviceMedia, "brand" | "name" | "network">) {
  return `${identity.brand}-${identity.name}-${identity.network}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const deviceMediaRegistry: readonly DeviceMedia[] = catalog.flatMap((model) =>
  model.network.map((network) => {
    const identity = { brand: model.brand, name: model.name, network };
    return {
      ...identity,
      path: `/images/devices/${assetSlug(identity)}.webp`,
      alt: `صورة ${model.brand} ${model.name} ${network}`,
      sourceUrl: deviceSources[createSpecificationKey(identity)] ?? "",
    };
  }),
);

export const brandMediaRegistry: Readonly<Record<string, BrandMedia>> = {
  Samsung: { brand: "Samsung", path: "/images/brands/samsung.webp", alt: "شعار سامسونج", sourceUrl: "https://www.samsung.com/etc.clientlibs/samsung/clientlibs/consumer/global/clientlib-common/resources/images/logo-square-letter.png" },
  Xiaomi: { brand: "Xiaomi", path: "/images/brands/xiaomi.webp", alt: "شعار شاومي", sourceUrl: "https://i01.appmifile.com/webfile/globalimg/mobile/logo/mi.png" },
  Poco: { brand: "Poco", path: "/images/brands/poco.webp", alt: "شعار بوكو", sourceUrl: "https://i01.appmifile.com/webfile/globalimg/i18n/poco/POCO.png" },
  Apple: { brand: "Apple", path: "/images/brands/apple.webp", alt: "شعار آبل", sourceUrl: "https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png" },
  Infinix: { brand: "Infinix", path: "/images/brands/infinix.webp", alt: "شعار إنفينيكس", sourceUrl: "https://www.infinixmobility.com/_nuxt/img/footerlogo.99b6809.png" },
  Tecno: { brand: "Tecno", path: "/images/brands/tecno.svg", alt: "شعار تكنو", sourceUrl: "https://d13pvy8xd75yde.cloudfront.net/global/homepage/new_global/headerLogo/All.svg" },
  Realme: { brand: "Realme", path: "/images/brands/realme.svg", alt: "شعار ريلمي", sourceUrl: "https://image01.realme.net/general/20190703/1562162458495.svg" },
  Honor: { brand: "Honor", path: "/images/brands/honor.svg", alt: "شعار هونر", sourceUrl: "https://www-file.honor.com/content/dam/honor/common/logo/honor-logo-black.svg" },
  Oppo: { brand: "Oppo", path: "/images/brands/oppo.svg", alt: "شعار أوبو", sourceUrl: "https://www.oppo.com/jimu/oppo-site-nav/resources/images/svg/brand-icon-en-dark.svg" },
};

export function getDeviceMedia(product: ProductIdentity) {
  return deviceMediaRegistry.find(
    (media) => createSpecificationKey(media) === createSpecificationKey(product),
  );
}

export function getBrandMedia(brand: string) {
  return brandMediaRegistry[brand];
}
