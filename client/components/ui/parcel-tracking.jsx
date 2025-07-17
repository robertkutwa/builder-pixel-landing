import React, { useState, useEffect, useRef } from "react";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Badge } from "./badge";
import { Progress } from "./progress";
import { Separator } from "./separator";
import { Alert, AlertDescription } from "./alert";
import {
  MapPin,
  Navigation,
  Clock,
  Truck,
  Package,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Route,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { STATUS_LABELS } from "../../../shared/api.js";
import { cn } from "../../lib/utils";

// Mock Google Maps component (in real implementation, use @googlemaps/react-wrapper)
const GoogleMap = ({ pickup, delivery, current, className }) => {
  const mapRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn("relative bg-muted rounded-lg overflow-hidden", className)}
    >
      {/* Mock Map Interface */}
      <div
        ref={mapRef}
        className={cn(
          "bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted-foreground/20",
          isExpanded ? "h-96" : "h-48",
        )}
      >
        <div className="text-center space-y-2">
          <MapPin className="w-8 h-8 mx-auto" />
          <div className="text-sm font-medium">Route Visualization</div>
          <div className="text-xs">
            {Math.round(
              Math.sqrt(
                Math.pow(delivery.lat - pickup.lat, 2) +
                  Math.pow(delivery.lng - pickup.lng, 2),
              ) * 111,
            )}{" "}
            km route
          </div>
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Pickup</span>
            </div>
            {current && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                <span>Current</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-2 right-2 flex space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0 bg-background/80 backdrop-blur"
        >
          {isExpanded ? (
            <Minimize2 className="w-3 h-3" />
          ) : (
            <Maximize2 className="w-3 h-3" />
          )}
        </Button>
      </div>

      {/* Route Info Overlay */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="bg-background/90 backdrop-blur rounded-md p-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-medium">Route Information</span>
            <span className="text-muted-foreground">Live Tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export function ParcelTracking({
  parcel,
  onRefresh,
  showMap = true,
  className,
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

  // Auto-refresh every 30 seconds for active parcels
  useEffect(() => {
    if (!["delivered", "cancelled"].includes(parcel.status)) {
      const interval = setInterval(() => {
        handleRefresh();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [parcel.status]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLastUpdated(new Date());

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (onRefresh) {
      onRefresh();
    }

    setIsRefreshing(false);
  };

    const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "pending":
      case "confirmed":
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Truck className="w-4 h-4 text-primary" />;
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

    const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-success/10 text-success border-success/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "pending":
      case "confirmed":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const isActiveParcel = !["delivered", "cancelled"].includes(parcel.status);
  const currentLocation = parcel.currentLocation || parcel.pickupLocation;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(parcel.status)}
              <div>
                <CardTitle className="text-xl">
                  {STATUS_LABELS[parcel.status]}
                </CardTitle>
                <CardDescription>
                  {parcel.trackingNumber} • Last updated{" "}
                  {lastUpdated.toLocaleTimeString()}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className={cn("text-sm", getStatusColor(parcel.status))}
              >
                {STATUS_LABELS[parcel.status]}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={cn("w-4 h-4", isRefreshing && "animate-spin")}
                />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Delivery Progress</span>
                <span>{getProgressValue(parcel.status)}%</span>
              </div>
              <Progress
                value={getProgressValue(parcel.status)}
                className="h-3"
              />
            </div>

            {/* ETA and Distance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
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
                <div className="text-sm text-muted-foreground">Travel Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {parcel.estimatedDeliveryAt
                    ? new Date(parcel.estimatedDeliveryAt).toLocaleDateString()
                    : "TBD"}
                </div>
                <div className="text-sm text-muted-foreground">ETA</div>
              </div>
            </div>

            {/* Live Status for Active Parcels */}
            {isActiveParcel && (
              <Alert className="border-primary/20 bg-primary/5">
                <Truck className="h-4 w-4 text-primary" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>
                      Your parcel is currently{" "}
                      {STATUS_LABELS[
                        parcel.status
                      ].toLowerCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Auto-updating every 30s
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Google Maps Integration */}
      {showMap && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Route className="w-5 h-5" />
              <span>Route Tracking</span>
            </CardTitle>
            <CardDescription>
              Real-time location and route visualization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoogleMap
              pickup={{
                lat: parcel.pickupLocation.latitude,
                lng: parcel.pickupLocation.longitude,
              }}
              delivery={{
                lat: parcel.deliveryLocation.latitude,
                lng: parcel.deliveryLocation.longitude,
              }}
              current={
                currentLocation
                  ? {
                      lat: currentLocation.latitude,
                      lng: currentLocation.longitude,
                    }
                  : undefined
              }
              className="w-full"
            />

            {/* Location Details */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-primary">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">Pickup Location</span>
                </div>
                <div className="pl-6 text-sm">
                  <div className="font-medium">
                    {parcel.pickupLocation.address}
                  </div>
                  <div className="text-muted-foreground">
                    {parcel.pickupLocation.city}, {parcel.pickupLocation.state}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-accent">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">Delivery Location</span>
                </div>
                <div className="pl-6 text-sm">
                  <div className="font-medium">
                    {parcel.deliveryLocation.address}
                  </div>
                  <div className="text-muted-foreground">
                    {parcel.deliveryLocation.city},{" "}
                    {parcel.deliveryLocation.state}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Location for Active Parcels */}
            {isActiveParcel && currentLocation && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-warning">
                    <Navigation className="w-4 h-4" />
                    <span className="font-medium">Current Location</span>
                    <Badge variant="outline" className="text-xs">
                      Live
                    </Badge>
                  </div>
                  <div className="pl-6 text-sm">
                    <div className="font-medium">{currentLocation.address}</div>
                    <div className="text-muted-foreground">
                      {currentLocation.city}, {currentLocation.state}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Status History</span>
          </CardTitle>
          <CardDescription>
            Complete timeline of your parcel's journey
          </CardDescription>
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
                        {
                          STATUS_LABELS[
                            status.status as keyof typeof STATUS_LABELS
                          ]
                        }
                      </span>
                      {index === 0 && (
                        <Badge variant="outline" className="text-xs">
                          Latest
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        by {status.updatedByName}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {status.message}
                    </div>
                    {status.location && (
                      <div className="text-xs text-muted-foreground mb-1">
                        📍 {status.location.city}, {status.location.state}
                      </div>
                    )}
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
  );
}