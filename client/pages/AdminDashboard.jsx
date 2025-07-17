import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Package,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Eye,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Truck,
  Calendar,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { STATUS_LABELS } from "../../shared/api.js";
import { cn } from "../lib/utils";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const authenticatedFetch = useAuthenticatedFetch();

  const [parcels, setParcels] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("pending");
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);

      // Fetch all parcels
      const parcelsResponse = await authenticatedFetch("/api/parcels?limit=50");
      const parcelsData = await parcelsResponse.json();

      if (parcelsData.success && parcelsData.data) {
        setParcels(parcelsData.data.items);

        // Calculate admin stats
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
          cancelledParcels: items.filter((p) => p.status === "cancelled")
            .length,
          totalRevenue: items
            .filter((p) => p.status === "delivered")
            .reduce((sum, p) => sum + p.totalCost, 0),
          averageDeliveryTime: 24, // This would be calculated from actual delivery data
        };
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const updateParcelStatus = async () => {
    if (!selectedParcel) return;

    try {
      setUpdateLoading(true);
      setError(null);

      const updateData = {
        status: newStatus,
        message: statusMessage || `Status updated to ${newStatus}`,
      };

      const response = await authenticatedFetch(
        `/api/parcels/${selectedParcel.id}/status`,
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        },
      );

      const data = await response.json();

      if (data.success && data.data) {
        // Update the parcel in our local state
        setParcels((prev) =>
          prev.map((p) => (p.id === selectedParcel.id ? data.data : p)),
        );
        setUpdateDialogOpen(false);
        setSelectedParcel(null);
        setStatusMessage("");
        // Refresh stats
        fetchAdminData();
      } else {
        setError(data.error || "Failed to update parcel status");
      }
    } catch (error) {
      setError("Failed to update parcel status");
    } finally {
      setUpdateLoading(false);
    }
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

  const getStatusBadgeVariant = (status) => {
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

  const filteredParcels = parcels.filter((parcel) => {
    const matchesSearch =
      parcel.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || parcel.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-4">
          This area is restricted to administrators only.
        </p>
        <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Manage all parcels and monitor system performance
          </p>
        </div>
        <div className="mt-4 lg:mt-0 flex space-x-2">
          <Button
            variant="outline"
            onClick={fetchAdminData}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Parcels
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParcels}</div>
              <p className="text-xs text-muted-foreground">All shipments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {stats.pendingParcels}
              </div>
              <p className="text-xs text-muted-foreground">Need attention</p>
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
              <p className="text-xs text-muted-foreground">Currently moving</p>
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
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">From deliveries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageDeliveryTime}h
              </div>
              <p className="text-xs text-muted-foreground">Delivery time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="parcels" className="space-y-6">
        <TabsList>
          <TabsTrigger value="parcels">Parcel Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="parcels" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by tracking number, customer, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Label htmlFor="status-filter">Status Filter</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="picked_up">Picked Up</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="out_for_delivery">
                        Out for Delivery
                      </SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parcels Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Parcels ({filteredParcels.length})</CardTitle>
              <CardDescription>
                Manage and track all shipments in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParcels.map((parcel) => (
                      <TableRow key={parcel.id}>
                        <TableCell className="font-medium">
                          {parcel.trackingNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {parcel.customerName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {parcel.customerEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                From:
                              </span>{" "}
                              {parcel.pickupLocation.city}
                            </div>
                            <div>
                              <span className="text-muted-foreground">To:</span>{" "}
                              {parcel.deliveryLocation.city}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={getStatusBadgeVariant(parcel.status)}
                          >
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(parcel.status)}
                              <span>{STATUS_LABELS[parcel.status]}</span>
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>${parcel.totalCost}</TableCell>
                        <TableCell>
                          {new Date(parcel.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/parcels/${parcel.id}`)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedParcel(parcel);
                                setNewStatus(parcel.status);
                                setUpdateDialogOpen(true);
                              }}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Update
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
                <CardDescription>
                  Key metrics for operational efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>On-time Delivery Rate</span>
                    <span className="font-bold text-success">96.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Delivery Time</span>
                    <span className="font-bold">
                      {stats?.averageDeliveryTime}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Satisfaction</span>
                    <span className="font-bold text-success">4.8/5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Revenue and cost analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-bold">
                      ${stats?.totalRevenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Order Value</span>
                    <span className="font-bold">
                      $
                      {stats
                        ? (
                            stats.totalRevenue /
                            Math.max(stats.deliveredParcels, 1)
                          ).toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Growth</span>
                    <span className="font-bold text-success">+12.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Parcel Status</DialogTitle>
            <DialogDescription>
              Update the status of parcel {selectedParcel?.trackingNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-status">New Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="out_for_delivery">
                    Out for Delivery
                  </SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-message">Status Message (Optional)</Label>
              <Input
                id="status-message"
                placeholder="Add a note about this status update..."
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={updateParcelStatus}
              disabled={updateLoading}
              className="btn-primary"
            >
              {updateLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
