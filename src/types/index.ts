// ============================================
// Tarife Attär - Type Definitions
// ============================================

// Navigation & UI State
export type EntryState = 'idle' | 'atlas' | 'relic';
export type CollectionType = 'atlas' | 'relic';
export type Theme = 'light' | 'dark';

// Shoppable Image System
export interface Hotspot {
  x: number;
  y: number;
  label: string;
  link?: string;
  annotation?: string;
  productReference?: string;
}

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface ShoppableImage {
  image: SanityImage;
  alt: string;
  hotspots: Hotspot[];
}

// Museum & Exhibit System
export interface Artifact {
  product: string;
  museumLabel: string;
  coordinates: { x: number; y: number };
}

export interface MuseumExhibit {
  exhibitImage: SanityImage;
  caption: string;
  artifacts: Artifact[];
}

// Field Reports (Atlas Collection)
export interface FieldReport {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  coordinates: string;
}

// Product System
export type ProductFormat = 
  | 'Perfume Oil' 
  | 'Atmosphere Mist' 
  | 'Traditional Attar' 
  | 'Pure Distillate';

export type HardwareType = 
  | 'Roller' 
  | 'Spray' 
  | 'Dropper' 
  | 'Dip Stick' 
  | 'Vial';

export interface Product {
  id: string;
  title: string;
  slug?: string;
  price: string;
  imageUrl: string;
  mainImage?: SanityImage;
  collectionType: CollectionType;
  productFormat: ProductFormat;
  volume: string;
  hardware?: HardwareType;
  
  // Rich Content
  fieldReport?: ShoppableImage;
  museumExhibit?: MuseumExhibit;
  description?: string;
  
  // Metadata
  gpsCoordinates?: string;
  scentVibe?: string;
  fieldJournalEntry?: string;
  distillationYear?: string;
  origin?: string;
  materialType?: string;
  
  // Wholesale
  isWholesaleEnabled?: boolean;
  wholesalePrice?: string;
  caseQuantity?: number;
  leadTime?: string;
  replenishToken?: string;
  
  // Retail/Kiosk
  kioskBlurb?: string;
  printLabelQr?: string;
}

// Cart System
export interface CartItem extends Product {
  quantity: number;
}

// Sanity Document Types (for queries)
export interface SanityProduct {
  _id: string;
  _type: 'product';
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: { current: string };
  brand?: string;
  year?: number;
  concentration?: string;
  perfumer?: string;
  notes?: {
    top?: string[];
    heart?: string[];
    base?: string[];
  };
  description?: Array<{
    _type: 'block';
    children: Array<{ text: string }>;
  }>;
  mainImage?: SanityImage;
  gallery?: SanityImage[];
}

export interface SanityExhibit {
  _id: string;
  _type: 'exhibit';
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: { current: string };
  subtitle?: string;
  coverImage?: SanityImage;
  body?: Array<{
    _type: 'block' | 'image';
    children?: Array<{ text: string }>;
  }>;
  featuredProducts?: SanityProduct[];
}
