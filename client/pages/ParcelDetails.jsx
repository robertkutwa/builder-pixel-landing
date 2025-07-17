import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, useAuthenticatedFetch } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
import { ParcelTracking } from "../components/ui/parcel-tracking";
import {
  Package,
  MapPin,
  Clock,
  User,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Truck,
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  Weight,
  Ruler,
} from "lucide-react";
import { STATUS_LABELS } from "../../shared/api.js";
import { cn } from "../lib/utils";

export default function ParcelDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const authenticatedFetch = useAuthenticatedFetch();

  const [parcel, setParcel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id && user) {
      fetchParcelDetails();
    }
  }, [id, user]);

  const fetchParcelDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authenticatedFetch(`/api/parcels/${id}`);
      const data = await response.json();

      if (data.success && data.data) {
        setParcel(data.data);
      } else {
        setError(data.error || "Failed to load parcel details");
      }
    } catch (error) {
      setError("Failed to load parcel details");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-destructive" />;
      case "pending":
      case "confirmed":
        return <AlertCircle className="w-5 h-5 text-warning" />;
      default:
        return <Truck className="w-5 h-5 text-primary" />;
    }
  };

  const getProgressValue = (status) => {
    switch (status) {
      case "pending":
        return 10;
      case "confirmed":
        return 25;
      case "picked_up":
        return 40;
      case "in_transit":
        return 65;
      case "out_for_delivery":
        return 85;
      case "delivered":
        return 100;
      case "cancelled":
        return 0;
      default:
        return 0;
    }
  };

  const canEdit = () => {
    return (
      parcel &&
      user &&
      (user.role === "admin" ||
        (user.id === parcel.customerId &&
          ["pending", "confirmed"].includes(parcel.status)))
    );
  };

  const canCancel = () => {
    return (
      parcel &&
      user &&
      user.id === parcel.customerId &&
      !["delivered", "cancelled"].includes(parcel.status)
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">
          Please log in to view parcel details
        </h1>
        <Button onClick={() => navigate("/login")}>Go to Login</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Parcel not found"}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{parcel.trackingNumber}</h1>
            <p className="text-muted-foreground">
              Created on {new Date(parcel.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {canEdit() && (
            <Button
              variant="outline"
              onClick={() => navigate(`/parcels/${parcel.id}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          {canCancel() && (
            <Button
              variant="outline"
              onClick={() => {
                // Implement cancel functionality here or navigate to edit page
                navigate(`/parcels/${parcel.id}/edit`);
              }}
            >
              Cancel Shipment
            </Button>
          )}
        </div>
      </div>

      {/* Real-time Tracking */}
      <ParcelTracking
        parcel={parcel}
        onRefresh={fetchParcelDetails}
        showMap={true}
        className="mb-8"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Package Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Package Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Description
                  </div>
                  <div className="font-medium">{parcel.description}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Value
                  </div>
                  <div className="font-medium">${parcel.value}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Weight
                  </div>
                  <div className="flex items-center space-x-1">
                    <Weight className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{parcel.size.weight} kg</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Dimensions
                  </div>
                  <div className="flex items-center space-x-1">
                    <Ruler className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {parcel.size.length} × {parcel.size.width} ×{" "}
                      {parcel.size.height} cm
                    </span>
                  </div>
                </div>
              </div>
              {parcel.specialInstructions && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Special Instructions
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md text-sm">
                    {parcel.specialInstructions}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Route Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Route Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-primary">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">Pickup Location</span>
                  </div>
                  <div className="pl-6 space-y-1">
                    <div className="font-medium">
                      {parcel.pickupLocation.address}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {parcel.pickupLocation.city},{" "}
                      {parcel.pickupLocation.state}{" "}
                      {parcel.pickupLocation.postalCode}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {parcel.pickupLocation.country}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-accent">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">Delivery Location</span>
                  </div>
                  <div className="pl-6 space-y-1">
                    <div className="font-medium">
                      {parcel.deliveryLocation.address}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {parcel.deliveryLocation.city},{" "}
                      {parcel.deliveryLocation.state}{" "}
                      {parcel.deliveryLocation.postalCode}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {parcel.deliveryLocation.country}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {parcel.routeInfo.distance} km
                  </div>
                  <div className="text-sm text-muted-foreground">Distance</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(parcel.routeInfo.duration / 60)}h{" "}
                    {parcel.routeInfo.duration % 60}m
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Estimated Time
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {parcel.weightCategory}
                  </div>
                  <div className="text-sm text-muted-foreground">Category</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Status History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {parcel.statusHistory
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime(),
                  )
                  .map((status, index) => (
                    <div key={status.id} className="flex space-x-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full",
                            index === 0 ? "bg-primary" : "bg-muted",
                          )}
                        />
                        {index < parcel.statusHistory.length - 1 && (
                          <div className="w-px h-8 bg-muted mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">
                            {STATUS_LABELS[status.status]}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            by {status.updatedByName}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {status.message}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(status.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Customer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-medium">{parcel.customerName}</div>
                <div className="text-sm text-muted-foreground">
                  Customer ID: {parcel.customerId}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{parcel.customerEmail}</span>
                </div>
                {parcel.customerPhone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{parcel.customerPhone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Pricing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Base Cost</span>
                <span className="font-medium">${parcel.baseCost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Weight Fee</span>
                <span className="font-medium">${parcel.weightCost}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold text-primary">
                  ${parcel.totalCost}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Created
                </div>
                <div className="text-sm">
                  {new Date(parcel.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </div>
                <div className="text-sm">
                  {new Date(parcel.updatedAt).toLocaleString()}
                </div>
              </div>
              {parcel.estimatedDeliveryAt && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Estimated Delivery
                  </div>
                  <div className="text-sm">
                    {new Date(parcel.estimatedDeliveryAt).toLocaleString()}
                  </div>
                </div>
              )}
              {parcel.deliveredAt && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Delivered
                  </div>
                  <div className="text-sm text-success">
                    {new Date(parcel.deliveredAt).toLocaleString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
