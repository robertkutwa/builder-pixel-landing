// ============================================================================
// DELIVEROO API TYPES - Shared between client and server
// ============================================================================
// Constants
export const WEIGHT_LIMITS = {
    light: { min: 0, max: 2 }, // 0-2kg
    medium: { min: 2, max: 10 }, // 2-10kg
    heavy: { min: 10, max: 30 }, // 10-30kg
    extra_heavy: { min: 30, max: 100 }, // 30-100kg
};
export const WEIGHT_PRICES = {
    light: 5, // $5 base
    medium: 12, // $12 base
    heavy: 25, // $25 base
    extra_heavy: 50, // $50 base
};
export const STATUS_COLORS = {
    pending: "warning",
    confirmed: "primary",
    picked_up: "primary",
    in_transit: "primary",
    out_for_delivery: "primary",
    delivered: "success",
    cancelled: "destructive",
};
export const STATUS_LABELS = {
    pending: "Pending Confirmation",
    confirmed: "Confirmed",
    picked_up: "Picked Up",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
};
