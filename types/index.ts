export type UserRole = 'farmer' | 'buyer' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  district?: string;
  state?: string;
  pincode?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FarmerProfile {
  id: string;
  user_id: string;
  farm_name: string;
  farm_description?: string;
  farm_address?: string;
  crops_grown: string[];
  is_verified: boolean;
  verification_notes?: string;
  created_at?: string;
}

export type CropGrade = 'Grade A' | 'Grade B' | 'Grade C' | 'Organic Certified';
export type CropUnit = 'kg' | 'quintal' | 'tonne' | 'crate' | 'bag';
export type CropStatus = 'draft' | 'pending_approval' | 'active' | 'paused' | 'sold_out' | 'rejected';

export interface CropImage {
  id: string;
  listing_id: string;
  image_url: string;
  sort_order: number;
  alt_text?: string;
}

export interface CropListing {
  id: string;
  farmer_id: string;
  farmer_name?: string;
  farm_name?: string;
  farmer_rating?: number;
  farmer_verified?: boolean;
  category_id?: string;
  category_name?: string;
  title: string;
  slug: string;
  variety: string;
  grade: CropGrade;
  description: string;
  unit: CropUnit;
  price_per_unit: number;
  discount_percentage?: number;
  discount_price_per_unit?: number;
  market_price_per_unit?: number;
  distance_km?: number;
  min_order_quantity: number;
  stock_quantity: number;
  reserved_quantity: number;
  harvest_date: string;
  available_from?: string;
  available_until?: string;
  district: string;
  state: string;
  pickup_available: boolean;
  delivery_available: boolean;
  delivery_fee_per_unit: number;
  status: CropStatus;
  rejection_reason?: string;
  images?: CropImage[] | string[];
  primary_image?: string;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  listing_id: string;
  crop: CropListing;
  quantity: number;
  delivery_choice: 'pickup' | 'delivery';
  price_per_unit: number;
  line_total: number;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export type PaymentMethod = 'cod' | 'razorpay';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type FulfillmentStatus = 'pending' | 'accepted' | 'packed' | 'dispatched' | 'delivered' | 'cancelled' | 'disputed';

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  farmer_id: string;
  farmer_name?: string;
  subtotal: number;
  delivery_fee: number;
  platform_fee: number;
  discount_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  shipping_address: Address;
  delivery_type: string;
  notes?: string;
  items?: OrderItem[];
  placed_at: string;
  accepted_at?: string;
  dispatched_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  listing_id?: string;
  crop_title: string;
  variety?: string;
  unit: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  image_url?: string;
}

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitationProb: number;
  condition: string;
  icon: string;
  forecast: Array<{
    day: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    precipitationProb: number;
  }>;
  agriculturalAdvice: {
    title: string;
    harvestNotice: string;
    sprayAdvice: string;
    irrigationAdvice: string;
  };
}

export interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_district: string;
  topic: string;
  title: string;
  body: string;
  image_url?: string;
  status: 'active' | 'flagged' | 'removed';
  upvotes: number;
  reply_count: number;
  created_at: string;
}

export interface CommunityReply {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_district: string;
  body: string;
  status: 'active' | 'flagged' | 'removed';
  created_at: string;
}

export interface ResourceArticle {
  id: string;
  title: string;
  slug: string;
  topic: 'soil_types' | 'plant_diseases' | 'pest_management' | 'crop_management' | 'sustainable_farming';
  topic_label: string;
  summary: string;
  content: string;
  thumbnail_url: string;
  read_time: string;
  published_date: string;
}
