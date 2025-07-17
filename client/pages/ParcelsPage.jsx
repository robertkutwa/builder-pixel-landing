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
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  X,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  RefreshCw,
  Download,
  SortAsc,
  SortDesc,
  ArrowUpDown,
} from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS } from "../../shared/api.js";
import { cn } from "../lib/utils";

export default function ParcelsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const authenticatedFetch = useAuthenticatedFetch();

  const [parcels, setParcels] = useState([]);
  const [filteredParcels, setFilteredParcels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // UI state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user) {
      fetchParcels();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortParcels();
  }, [parcels, searchTerm, statusFilter, dateFilter, sortField, sortOrder]);

  const fetchParcels = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authenticatedFetch("/api/parcels?limit=100");
      const data = await response.json();

      if (data.success && data.data) {
        setParcels(data.data.items);
      } else {
        setError(data.error || "Failed to load parcels");
      }
    } catch (error) {
      setError("Failed to load parcels");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortParcels = () => {
    let filtered = [...parcels];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (parcel) =>
          parcel.trackingNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          parcel.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          parcel.pickupLocation.city
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          parcel.deliveryLocation.city
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((parcel) => parcel.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(
            (parcel) => new Date(parcel.createdAt) >= filterDate,
          );
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(
            (parcel) => new Date(parcel.createdAt) >= filterDate,
          );
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(
            (parcel) => new Date(parcel.createdAt) >= filterDate,
          );
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "totalCost":
          aValue = a.totalCost;
          bValue = b.totalCost;
          break;
        case "trackingNumber":
          aValue = a.trackingNumber;
          bValue = b.trackingNumber;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredParcels(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const cancelParcel = async () => {
    if (!selectedParcel) return;

    try {
      setCancelling(true);
      setError(null);

      const response = await authenticatedFetch(
        `/api/parcels/${selectedParcel.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (data.success) {
        // Update the parcel in local state
        setParcels((prev) =>
          prev.map((p) =>
            p.id === selectedParcel.id ? { ...p, status: "cancelled" } : p,
          ),
        );
        setCancelDialogOpen(false);
        setSelectedParcel(null);
      } else {
        setError(data.error || "Failed to cancel parcel");
      }
    } catch (error) {
      setError("Failed to cancel parcel");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status: string) => {
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

  const getStatusBadgeVariant = (status: string) => {
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

  const canCancelParcel = (parcel) => {
    return (
      user &&
      user.id === parcel.customerId &&
      !["delivered", "cancelled"].includes(parcel.status)
    );
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    return sortOrder === "asc" ? (
      <SortAsc className="w-4 h-4 text-primary" />
    ) : (
      <SortDesc className="w-4 h-4 text-primary" />
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredParcels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParcels = filteredParcels.slice(startIndex, endIndex);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">
          Please log in to view your parcels
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
          <h1 className="text-3xl font-bold mb-2">My Parcels</h1>
          <p className="text-muted-foreground text-lg">
            Manage and track all your shipments
          </p>
        </div>
        <div className="mt-4 lg:mt-0 flex space-x-2">
          <Button variant="outline" onClick={fetchParcels} disabled={isLoading}>
            <RefreshCw
              className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")}
            />
            Refresh
          </Button>
          <Button
            onClick={() => navigate("/parcels/new")}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Shipment
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search parcels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status-filter">Status</Label>
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

            <div>
              <Label htmlFor="date-filter">Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setDateFilter("all");
                }}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {currentParcels.length} of {filteredParcels.length}{" "}
              parcels
            </span>
            <span>Total: {parcels.length} parcels</span>
          </div>
        </CardContent>
      </Card>

      {/* Parcels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Parcels List</CardTitle>
          <CardDescription>
            Click on any parcel to view detailed information
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
          ) : currentParcels.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("trackingNumber")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Tracking #</span>
                        {getSortIcon("trackingNumber")}
                      </div>
                    </TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Status</span>
                        {getSortIcon("status")}
                      </div>
                    </TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("totalCost")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Cost</span>
                        {getSortIcon("totalCost")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Created</span>
                        {getSortIcon("createdAt")}
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentParcels.map((parcel) => (
                    <TableRow
                      key={parcel.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/parcels/${parcel.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">
                            {parcel.trackingNumber}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {parcel.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center space-x-1 mb-1">
                            <MapPin className="w-3 h-3 text-primary" />
                            <span>{parcel.pickupLocation.city}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-accent" />
                            <span>{parcel.deliveryLocation.city}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            getStatusBadgeVariant(parcel.status),
                          )}
                        >
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(parcel.status)}
                            <span>
                              {
                                STATUS_LABELS[
                                  parcel.status as keyof typeof STATUS_LABELS
                                ]
                              }
                            </span>
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress
                            value={getProgressValue(parcel.status)}
                            className="h-2 mb-1"
                          />
                          <div className="text-xs text-muted-foreground">
                            {getProgressValue(parcel.status)}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${parcel.totalCost}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(parcel.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="flex space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/parcels/${parcel.id}`)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          {canCancelParcel(parcel) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedParcel(parcel);
                                setCancelDialogOpen(true);
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No parcels found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "You haven't created any shipments yet."}
              </p>
              <Button onClick={() => navigate("/parcels/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Shipment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Parcel</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel parcel{" "}
              {selectedParcel?.trackingNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Keep Parcel
            </Button>
            <Button
              variant="destructive"
              onClick={cancelParcel}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Parcel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
