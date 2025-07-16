import { RequestHandler } from "express";
import { z } from "zod";
import {
  Parcel,
  CreateParcelRequest,
  UpdateParcelRequest,
  UpdateParcelStatusRequest,
  ApiResponse,
  PaginatedResponse,
  ParcelStatus,
  WeightCategory,
  QuoteRequest,
  QuoteResponse,
  WEIGHT_LIMITS,
  WEIGHT_PRICES,
} from "@shared/api";

// Mock database
const mockParcels: Parcel[] = [
  {
    id: "parcel-1",
    trackingNumber: "DEL-2024-001",
    customerId: "customer-1",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "+1234567891",
    description: "Electronics - Laptop",
    value: 1200,
    size: { length: 35, width: 25, height: 5, weight: 2.5 },
    weightCategory: "medium",
    specialInstructions: "Handle with care",
    pickupLocation: {
      latitude: 40.7128,
      longitude: -74.006,
      address: "123 Tech Street",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
    },
    deliveryLocation: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: "456 Business Ave",
      city: "New York",
      state: "NY",
      postalCode: "10019",
      country: "USA",
    },
    routeInfo: {
      distance: 8.5,
      duration: 25,
    },
    baseCost: 15,
    weightCost: 12,
    totalCost: 27,
    status: "in_transit",
    statusHistory: [
      {
        id: "status-1",
        parcelId: "parcel-1",
        status: "pending",
        message: "Order placed",
        updatedBy: "customer-1",
        updatedByName: "John Doe",
        timestamp: "2024-01-15T10:00:00Z",
      },
      {
        id: "status-2",
        parcelId: "parcel-1",
        status: "confirmed",
        message: "Order confirmed by admin",
        updatedBy: "admin-1",
        updatedByName: "Admin User",
        timestamp: "2024-01-15T11:00:00Z",
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T11:00:00Z",
    estimatedDeliveryAt: "2024-01-16T14:00:00Z",
  },
];

// Validation schemas
const createParcelSchema = z.object({
  description: z.string().min(1, "Description is required"),
  value: z.number().min(0, "Value must be positive"),
  size: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
    weight: z.number().min(0),
  }),
  specialInstructions: z.string().optional(),
  pickupLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    additionalInfo: z.string().optional(),
  }),
  deliveryLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    additionalInfo: z.string().optional(),
  }),
  pickupScheduledAt: z.string().optional(),
});

const updateParcelStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "picked_up",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ]),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      address: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(1),
      additionalInfo: z.string().optional(),
    })
    .optional(),
  message: z.string().optional(),
});

// Helper functions
function calculateWeightCategory(weight: number): WeightCategory {
  if (weight <= WEIGHT_LIMITS.light.max) return "light";
  if (weight <= WEIGHT_LIMITS.medium.max) return "medium";
  if (weight <= WEIGHT_LIMITS.heavy.max) return "heavy";
  return "extra_heavy";
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  // Simplified distance calculation (in real app, use proper geolocation service)
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateCost(
  distance: number,
  weightCategory: WeightCategory,
): {
  baseCost: number;
  weightCost: number;
  totalCost: number;
} {
  const baseCost = Math.max(10, Math.round(distance * 1.5)); // $1.5 per km, min $10
  const weightCost = WEIGHT_PRICES[weightCategory];
  const totalCost = baseCost + weightCost;

  return { baseCost, weightCost, totalCost };
}

// Route handlers
export const handleGetQuote: RequestHandler = async (req, res) => {
  try {
    const quoteData = req.body as QuoteRequest;
    const { pickupLocation, deliveryLocation, size, value } = quoteData;

    const distance = calculateDistance(
      pickupLocation.latitude,
      pickupLocation.longitude,
      deliveryLocation.latitude,
      deliveryLocation.longitude,
    );

    const weightCategory = calculateWeightCategory(size.weight);
    const { baseCost, weightCost, totalCost } = calculateCost(
      distance,
      weightCategory,
    );

    const quote: QuoteResponse = {
      baseCost,
      weightCost,
      distanceCost: baseCost,
      totalCost,
      estimatedDeliveryTime: Math.max(2, Math.round((distance / 30) * 24)), // hours, assuming 30km/h average
      weightCategory,
      distance: Math.round(distance * 100) / 100,
    };

    res.status(200).json({
      success: true,
      data: quote,
    } as ApiResponse<QuoteResponse>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to calculate quote",
    } as ApiResponse);
  }
};

export const handleCreateParcel: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const validatedData = createParcelSchema.parse(req.body);

    const distance = calculateDistance(
      validatedData.pickupLocation.latitude,
      validatedData.pickupLocation.longitude,
      validatedData.deliveryLocation.latitude,
      validatedData.deliveryLocation.longitude,
    );

    const weightCategory = calculateWeightCategory(validatedData.size.weight);
    const { baseCost, weightCost, totalCost } = calculateCost(
      distance,
      weightCategory,
    );

    const newParcel: Parcel = {
      id: `parcel-${Date.now()}`,
      trackingNumber: `DEL-${new Date().getFullYear()}-${String(mockParcels.length + 1).padStart(3, "0")}`,
      customerId: user.id,
      customerName: `${user.firstName} ${user.lastName}`,
      customerEmail: user.email,
      customerPhone: user.phoneNumber || "",
      description: validatedData.description,
      value: validatedData.value,
      size: validatedData.size,
      weightCategory,
      specialInstructions: validatedData.specialInstructions,
      pickupLocation: validatedData.pickupLocation,
      deliveryLocation: validatedData.deliveryLocation,
      routeInfo: {
        distance: Math.round(distance * 100) / 100,
        duration: Math.max(30, Math.round((distance / 30) * 60)), // minutes
      },
      baseCost,
      weightCost,
      totalCost,
      status: "pending",
      statusHistory: [
        {
          id: `status-${Date.now()}`,
          parcelId: `parcel-${Date.now()}`,
          status: "pending",
          message: "Parcel delivery order created",
          updatedBy: user.id,
          updatedByName: `${user.firstName} ${user.lastName}`,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pickupScheduledAt: validatedData.pickupScheduledAt,
      estimatedDeliveryAt: new Date(
        Date.now() + Math.round((distance / 30) * 60 * 60 * 1000),
      ).toISOString(),
    };

    // Update the ID in status history
    newParcel.statusHistory[0].parcelId = newParcel.id;

    mockParcels.push(newParcel);

    res.status(201).json({
      success: true,
      data: newParcel,
      message: "Parcel created successfully",
    } as ApiResponse<Parcel>);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        data: error.errors,
      } as ApiResponse);
    }

    res.status(500).json({
      success: false,
      error: "Failed to create parcel",
    } as ApiResponse);
  }
};

export const handleGetParcels: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as ParcelStatus;

    let filteredParcels = mockParcels;

    // Filter by user role
    if (user.role === "customer") {
      filteredParcels = filteredParcels.filter((p) => p.customerId === user.id);
    }

    // Filter by status if provided
    if (status) {
      filteredParcels = filteredParcels.filter((p) => p.status === status);
    }

    // Pagination
    const total = filteredParcels.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = filteredParcels.slice(startIndex, endIndex);

    const response: PaginatedResponse<Parcel> = {
      items,
      total,
      page,
      limit,
      totalPages,
    };

    res.status(200).json({
      success: true,
      data: response,
    } as ApiResponse<PaginatedResponse<Parcel>>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get parcels",
    } as ApiResponse);
  }
};

export const handleGetParcel: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const parcel = mockParcels.find((p) => p.id === id);
    if (!parcel) {
      return res.status(404).json({
        success: false,
        error: "Parcel not found",
      } as ApiResponse);
    }

    // Check permissions
    if (user.role === "customer" && parcel.customerId !== user.id) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      } as ApiResponse);
    }

    res.status(200).json({
      success: true,
      data: parcel,
    } as ApiResponse<Parcel>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get parcel",
    } as ApiResponse);
  }
};

export const handleUpdateParcelStatus: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const validatedData = updateParcelStatusSchema.parse(req.body);

    const parcelIndex = mockParcels.findIndex((p) => p.id === id);
    if (parcelIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Parcel not found",
      } as ApiResponse);
    }

    const parcel = mockParcels[parcelIndex];

    // Create status update
    const statusUpdate = {
      id: `status-${Date.now()}`,
      parcelId: parcel.id,
      status: validatedData.status,
      location: validatedData.location,
      message:
        validatedData.message || `Status updated to ${validatedData.status}`,
      updatedBy: user.id,
      updatedByName: `${user.firstName} ${user.lastName}`,
      timestamp: new Date().toISOString(),
    };

    // Update parcel
    const updatedParcel: Parcel = {
      ...parcel,
      status: validatedData.status,
      currentLocation: validatedData.location || parcel.currentLocation,
      statusHistory: [...parcel.statusHistory, statusUpdate],
      updatedAt: new Date().toISOString(),
      deliveredAt:
        validatedData.status === "delivered"
          ? new Date().toISOString()
          : parcel.deliveredAt,
    };

    mockParcels[parcelIndex] = updatedParcel;

    res.status(200).json({
      success: true,
      data: updatedParcel,
      message: "Parcel status updated successfully",
    } as ApiResponse<Parcel>);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        data: error.errors,
      } as ApiResponse);
    }

    res.status(500).json({
      success: false,
      error: "Failed to update parcel status",
    } as ApiResponse);
  }
};

export const handleCancelParcel: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const parcelIndex = mockParcels.findIndex((p) => p.id === id);
    if (parcelIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Parcel not found",
      } as ApiResponse);
    }

    const parcel = mockParcels[parcelIndex];

    // Check permissions - only customer who created the parcel can cancel
    if (user.role === "customer" && parcel.customerId !== user.id) {
      return res.status(403).json({
        success: false,
        error: "You can only cancel your own parcels",
      } as ApiResponse);
    }

    // Check if parcel can be cancelled
    if (parcel.status === "delivered" || parcel.status === "cancelled") {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel parcel with status: ${parcel.status}`,
      } as ApiResponse);
    }

    // Create cancellation status update
    const statusUpdate = {
      id: `status-${Date.now()}`,
      parcelId: parcel.id,
      status: "cancelled" as ParcelStatus,
      message: "Parcel cancelled by customer",
      updatedBy: user.id,
      updatedByName: `${user.firstName} ${user.lastName}`,
      timestamp: new Date().toISOString(),
    };

    // Update parcel
    const updatedParcel = {
      ...parcel,
      status: "cancelled" as ParcelStatus,
      statusHistory: [...parcel.statusHistory, statusUpdate],
      updatedAt: new Date().toISOString(),
    };

    mockParcels[parcelIndex] = updatedParcel;

    res.status(200).json({
      success: true,
      data: updatedParcel,
      message: "Parcel cancelled successfully",
    } as ApiResponse<Parcel>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to cancel parcel",
    } as ApiResponse);
  }
};
