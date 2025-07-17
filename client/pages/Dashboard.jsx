import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import {
  Package,
  Plus,
  MapPin,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { STATUS_COLORS, STATUS_LABELS } from "../../shared/api.js";
import { cn } from "../lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const authenticatedFetch = useAuthenticatedFetch();

  const [parcels, setParcels] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch parcels
      const parcelsResponse = await authenticatedFetch("/api/parcels?limit=10");
      const parcelsData = await parcelsResponse.json();

      if (parcelsData.success && parcelsData.data) {
        setParcels(parcelsData.data.items);

        // Calculate stats from parcels
        const items = parcelsData.data.items;
        const calculatedStats = {
          totalParcels: items.length,
          pendingParcels: items.filter((p) =>
            ["pending", "confirmed"].includes(p.status),
          ).length,
          inTransitParcels: items.filter((p) =>
            ["picked_up", "in_transit", "out_for_delivery"].includes(p.status),
          ).length,
          deliveredParcels: items.filter((p) => p.status === "delivered")
            .length,
          totalSpent: items.reduce((sum, p) => sum + p.totalCost, 0),
        };
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

    const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "pending":
      case "confirmed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Truck className="w-4 h-4" />;
    }
  };

  const getProgressValue = (status: string) => {
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">
          Please log in to view your dashboard
        </h1>
        <Button onClick={() => navigate("/login")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your parcels and manage your deliveries
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Button
            onClick={() => navigate("/parcels/new")}
            className="btn-primary"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ship New Parcel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Parcels
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParcels}</div>
              <p className="text-xs text-muted-foreground">
                All time shipments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats.inTransitParcels}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently shipping
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {stats.deliveredParcels}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalSpent.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Shipping costs</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Shipments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to get you started</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto flex flex-col items-center p-6"
                onClick={() => navigate("/parcels/new")}
              >
                <Plus className="w-8 h-8 mb-2 text-primary" />
                <span className="font-medium">Create Shipment</span>
                <span className="text-sm text-muted-foreground">
                  Ship a new parcel
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex flex-col items-center p-6"
                onClick={() => navigate("/quote")}
              >
                <BarChart3 className="w-8 h-8 mb-2 text-primary" />
                <span className="font-medium">Get Quote</span>
                <span className="text-sm text-muted-foreground">
                  Calculate shipping cost
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex flex-col items-center p-6"
                onClick={() => navigate("/parcels")}
              >
                <Package className="w-8 h-8 mb-2 text-primary" />
                <span className="font-medium">View All Parcels</span>
                <span className="text-sm text-muted-foreground">
                  Manage shipments
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest shipments and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : parcels.length > 0 ? (
                <div className="space-y-4">
                  {parcels.slice(0, 5).map((parcel) => (
                    <div
                      key={parcel.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={cn(
                            "p-2 rounded-full",
                            parcel.status === "delivered"
                              ? "bg-success/10"
                              : parcel.status === "cancelled"
                                ? "bg-destructive/10"
                                : "bg-primary/10",
                          )}
                        >
                          {getStatusIcon(parcel.status)}
                        </div>
                        <div>
                          <div className="font-medium">
                            {parcel.trackingNumber}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {parcel.pickupLocation.city} →{" "}
                            {parcel.deliveryLocation.city}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "mb-1",
                            parcel.status === "delivered" &&
                              "bg-success/10 text-success",
                            parcel.status === "cancelled" &&
                              "bg-destructive/10 text-destructive",
                            [
                              "in_transit",
                              "picked_up",
                              "out_for_delivery",
                            ].includes(parcel.status) &&
                              "bg-primary/10 text-primary",
                          )}
                        >
                          {
                            STATUS_LABELS[
                              parcel.status as keyof typeof STATUS_LABELS
                            ]
                          }
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          ${parcel.totalCost}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No parcels yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first shipment to get started
                  </p>
                  <Button onClick={() => navigate("/parcels/new")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Shipment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Shipments</CardTitle>
              <CardDescription>
                Track your parcels currently in transit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {parcels
                .filter((p) => !["delivered", "cancelled"].includes(p.status))
                .map((parcel) => (
                  <div
                    key={parcel.id}
                    className="border rounded-lg p-6 mb-4 last:mb-0"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {parcel.trackingNumber}
                        </h3>
                        <p className="text-muted-foreground">
                          {parcel.description}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          [
                            "in_transit",
                            "picked_up",
                            "out_for_delivery",
                          ].includes(parcel.status) &&
                            "bg-primary/10 text-primary",
                        )}
                      >
                        {
                          STATUS_LABELS[
                            parcel.status as keyof typeof STATUS_LABELS
                          ]
                        }
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">From</div>
                          <div className="text-sm text-muted-foreground">
                            {parcel.pickupLocation.address},{" "}
                            {parcel.pickupLocation.city}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-accent" />
                        <div>
                          <div className="text-sm font-medium">To</div>
                          <div className="text-sm text-muted-foreground">
                            {parcel.deliveryLocation.address},{" "}
                            {parcel.deliveryLocation.city}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Delivery Progress</span>
                        <span>{getProgressValue(parcel.status)}%</span>
                      </div>
                      <Progress
                        value={getProgressValue(parcel.status)}
                        className="h-2"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {parcel.estimatedDeliveryAt && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              ETA:{" "}
                              {new Date(
                                parcel.estimatedDeliveryAt,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/parcels/${parcel.id}`)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                        {["pending", "confirmed"].includes(parcel.status) && (
                          <Button variant="outline" size="sm">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipment History</CardTitle>
              <CardDescription>All your past deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {parcels.map((parcel) => (
                  <div
                    key={parcel.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={cn(
                          "p-2 rounded-full",
                          parcel.status === "delivered"
                            ? "bg-success/10"
                            : parcel.status === "cancelled"
                              ? "bg-destructive/10"
                              : "bg-primary/10",
                        )}
                      >
                        {getStatusIcon(parcel.status)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {parcel.trackingNumber}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {parcel.pickupLocation.city} →{" "}
                          {parcel.deliveryLocation.city}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(parcel.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "mb-1",
                          parcel.status === "delivered" &&
                            "bg-success/10 text-success",
                          parcel.status === "cancelled" &&
                            "bg-destructive/10 text-destructive",
                        )}
                      >
                        {
                          STATUS_LABELS[
                            parcel.status as keyof typeof STATUS_LABELS
                          ]
                        }
                      </Badge>
                      <div className="text-sm font-medium">
                        ${parcel.totalCost}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}