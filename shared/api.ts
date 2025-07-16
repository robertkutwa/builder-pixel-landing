// ============================================================================
// DELIVEROO API TYPES - Shared between client and server
// ============================================================================

// Demo Response for testing
export interface DemoResponse {
  message: string;
}

// User Management Types
export type UserRole = "customer" | "admin" | "courier";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  profileImage?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: UserRole; // defaults to 'customer'
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface EmailVerificationRequest {
  token: string;
}

// Location and Address Types
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  additionalInfo?: string;
}

export interface RouteInfo {
  distance: number; // in kilometers
  duration: number; // in minutes
  polyline?: string; // encoded polyline for map display
}

// Parcel Management Types
export type ParcelStatus =
  | "pending"
  | "confirmed"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type WeightCategory = "light" | "medium" | "heavy" | "extra_heavy";

export interface ParcelSize {
  length: number; // cm
  width: number; // cm
  height: number; // cm
  weight: number; // kg
}

export interface Parcel {
  id: string;
  trackingNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // Package Details
  description: string;
  value: number; // monetary value
  size: ParcelSize;
  weightCategory: WeightCategory;
  specialInstructions?: string;

  // Locations
  pickupLocation: Location;
  deliveryLocation: Location;
  currentLocation?: Location;

  // Routing and Pricing
  routeInfo: RouteInfo;
  baseCost: number;
  weightCost: number;
  totalCost: number;

  // Status and Tracking
  status: ParcelStatus;
  statusHistory: ParcelStatusUpdate[];

  // Assignment
  courierId?: string;
  courierName?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  pickupScheduledAt?: string;
  deliveredAt?: string;
  estimatedDeliveryAt?: string;
}

export interface ParcelStatusUpdate {
  id: string;
  parcelId: string;
  status: ParcelStatus;
  location?: Location;
  message?: string;
  updatedBy: string; // user ID
  updatedByName: string;
  timestamp: string;
}

export interface CreateParcelRequest {
  description: string;
  value: number;
  size: ParcelSize;
  specialInstructions?: string;
  pickupLocation: Omit<Location, "additionalInfo"> & {
    additionalInfo?: string;
  };
  deliveryLocation: Omit<Location, "additionalInfo"> & {
    additionalInfo?: string;
  };
  pickupScheduledAt?: string;
}

export interface UpdateParcelRequest {
  deliveryLocation?: Location;
  specialInstructions?: string;
  pickupScheduledAt?: string;
}

export interface UpdateParcelStatusRequest {
  status: ParcelStatus;
  location?: Location;
  message?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

// Dashboard and Analytics Types
export interface DashboardStats {
  totalParcels: number;
  pendingParcels: number;
  inTransitParcels: number;
  deliveredParcels: number;
  cancelledParcels: number;
  totalRevenue: number;
  averageDeliveryTime: number; // in hours
}

export interface CustomerDashboardStats {
  totalParcels: number;
  pendingParcels: number;
  inTransitParcels: number;
  deliveredParcels: number;
  totalSpent: number;
}

// Notification Types
export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  statusUpdates: boolean;
  promotionalEmails: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: "status_update" | "delivery_reminder" | "promotional" | "system";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedParcelId?: string;
}

// Pricing and Quotes
export interface QuoteRequest {
  pickupLocation: Pick<Location, "latitude" | "longitude" | "city" | "state">;
  deliveryLocation: Pick<Location, "latitude" | "longitude" | "city" | "state">;
  size: ParcelSize;
  value: number;
}

export interface QuoteResponse {
  baseCost: number;
  weightCost: number;
  distanceCost: number;
  totalCost: number;
  estimatedDeliveryTime: number; // in hours
  weightCategory: WeightCategory;
  distance: number; // in km
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  validationErrors?: ValidationError[];
}

// Search and Filter Types
export interface ParcelFilters {
  status?: ParcelStatus[];
  weightCategory?: WeightCategory[];
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  courierId?: string;
  minValue?: number;
  maxValue?: number;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type CreateType<T> = Omit<T, "id" | "createdAt" | "updatedAt">;
export type UpdateType<T> = DeepPartial<
  Omit<T, "id" | "createdAt" | "updatedAt">
>;

// Constants
export const WEIGHT_LIMITS = {
  light: { min: 0, max: 2 }, // 0-2kg
  medium: { min: 2, max: 10 }, // 2-10kg
  heavy: { min: 10, max: 30 }, // 10-30kg
  extra_heavy: { min: 30, max: 100 }, // 30-100kg
} as const;

export const WEIGHT_PRICES = {
  light: 5, // $5 base
  medium: 12, // $12 base
  heavy: 25, // $25 base
  extra_heavy: 50, // $50 base
} as const;

export const STATUS_COLORS = {
  pending: "warning",
  confirmed: "primary",
  picked_up: "primary",
  in_transit: "primary",
  out_for_delivery: "primary",
  delivered: "success",
  cancelled: "destructive",
} as const;

export const STATUS_LABELS = {
  pending: "Pending Confirmation",
  confirmed: "Confirmed",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
} as const;
