export type EntryState = 'idle' | 'atlas' | 'relic';

export interface Hotspot {
  x: number;
  y: number;
  label: string;
  link?: string;
  annotation?: string;
  productReference?: string;
}

export interface ShoppableImage {
  image: any;
  alt: string;
  hotspots: Hotspot[];
}

export interface Artifact {
  product: string;
  museumLabel: string;
  coordinates: { x: number; y: number };
}

export interface MuseumExhibit {
  exhibitImage: any;
  caption: string;
  artifacts: Artifact[];
}

export interface FieldReport {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  coordinates: string;
}

export type ProductFormat = 'Perfume Oil' | 'Atmosphere Mist' | 'Traditional Attar' | 'Pure Distillate';
export type HardwareType = 'Roller' | 'Spray' | 'Dropper' | 'Dip Stick' | 'Vial';

export interface Product {
  id: string;
  title: string;
  price: string;
  imageUrl: string;
  collectionType: 'atlas' | 'relic';
  productFormat: ProductFormat;
  volume: string;
  hardware?: HardwareType;
  fieldReport?: ShoppableImage;
  museumExhibit?: MuseumExhibit;
  gpsCoordinates?: string;
  scentVibe?: string;
  fieldJournalEntry?: string;
  distillationYear?: string;
  origin?: string;
  materialType?: string;
  isWholesaleEnabled?: boolean;
  wholesalePrice?: string;
  caseQuantity?: number;
  leadTime?: string;
  replenishToken?: string;
  kioskBlurb?: string;
  printLabelQr?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
