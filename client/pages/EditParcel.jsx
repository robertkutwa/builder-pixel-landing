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
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import {
  Package,
  MapPin,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  X,
  Trash2,
  Edit,
  Calendar,
  DollarSign,
} from "lucide-react";

import { cn } from "../lib/utils";

export default function EditParcel() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const authenticatedFetch = useAuthenticatedFetch();

  const [parcel, setParcel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    deliveryLocation: {
      latitude: 0,
      longitude: 0,
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "USA",
    },
    specialInstructions: "",
    pickupScheduledAt: "",
  });

  // UI state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchParcelDetails();
    }
  }, [id, user]);

  useEffect(() => {
    if (parcel) {
      const initialData = {
        deliveryLocation: parcel.deliveryLocation,
        specialInstructions: parcel.specialInstructions || "",
        pickupScheduledAt: parcel.pickupScheduledAt
          ? new Date(parcel.pickupScheduledAt).toISOString().slice(0, 16)
          : "",
      };
      setFormData(initialData);
    }
  }, [parcel]);

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

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!parcel) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const updateData = {
        deliveryLocation: formData.deliveryLocation,
        specialInstructions: formData.specialInstructions,
        pickupScheduledAt: formData.pickupScheduledAt || undefined,
      };

      // Simulate API call - in real app, this would update the parcel
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess("Parcel updated successfully!");
      setHasChanges(false);

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(`/parcels/${parcel.id}`);
      }, 1500);
    } catch (error) {
      setError("Failed to update parcel");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!parcel) return;

    try {
      setIsCancelling(true);
      setError(null);

      const response = await authenticatedFetch(`/api/parcels/${parcel.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setCancelDialogOpen(false);
        navigate("/dashboard");
      } else {
        setError(data.error || "Failed to cancel parcel");
      }
    } catch (error) {
      setError("Failed to cancel parcel");
    } finally {
      setIsCancelling(false);
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
          Please log in to edit parcels
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

  if (error && !parcel) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
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

  if (!canEdit()) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This parcel cannot be edited at this time. Only pending or confirmed
            parcels can be modified.
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => navigate(`/parcels/${id}`)}
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          View Parcel Details
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(`/parcels/${id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Details
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Parcel</h1>
            <p className="text-muted-foreground">
              {parcel?.trackingNumber} - Modify delivery details
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {canCancel() && (
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Cancel Parcel
            </Button>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-success bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Package Information (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Package Information</span>
              </CardTitle>
              <CardDescription>
                Package details cannot be modified after creation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Description
                  </Label>
                  <div className="font-medium">{parcel?.description}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Value
                  </Label>
                  <div className="font-medium">${parcel?.value}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Weight
                  </Label>
                  <div className="font-medium">{parcel?.size.weight} kg</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Dimensions
                  </Label>
                  <div className="font-medium">
                    {parcel?.size.length} × {parcel?.size.width} ×{" "}
                    {parcel?.size.height} cm
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pickup Location (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Pickup Location</span>
              </CardTitle>
              <CardDescription>
                Pickup location cannot be modified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-medium">
                  {parcel?.pickupLocation.address}
                </div>
                <div className="text-sm text-muted-foreground">
                  {parcel?.pickupLocation.city}, {parcel?.pickupLocation.state}{" "}
                  {parcel?.pickupLocation.postalCode}
                </div>
                <div className="text-sm text-muted-foreground">
                  {parcel?.pickupLocation.country}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Location (Editable) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-accent" />
                <span>Delivery Location</span>
              </CardTitle>
              <CardDescription>Update the delivery destination</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="delivery-address">Street Address</Label>
                  <Input
                    id="delivery-address"
                    value={formData.deliveryLocation.address}
                    onChange={(e) =>
                      handleInputChange(
                        "deliveryLocation.address",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="delivery-city">City</Label>
                  <Input
                    id="delivery-city"
                    value={formData.deliveryLocation.city}
                    onChange={(e) =>
                      handleInputChange("deliveryLocation.city", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="delivery-state">State</Label>
                  <Input
                    id="delivery-state"
                    value={formData.deliveryLocation.state}
                    onChange={(e) =>
                      handleInputChange(
                        "deliveryLocation.state",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="delivery-postal">Postal Code</Label>
                  <Input
                    id="delivery-postal"
                    value={formData.deliveryLocation.postalCode}
                    onChange={(e) =>
                      handleInputChange(
                        "deliveryLocation.postalCode",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="delivery-country">Country</Label>
                  <Select
                    value={formData.deliveryLocation.country}
                    onValueChange={(value) =>
                      handleInputChange("deliveryLocation.country", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit className="w-5 h-5" />
                <span>Additional Details</span>
              </CardTitle>
              <CardDescription>
                Update special instructions and scheduling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="special-instructions">
                  Special Instructions
                </Label>
                <Textarea
                  id="special-instructions"
                  placeholder="Any special handling instructions..."
                  value={formData.specialInstructions}
                  onChange={(e) =>
                    handleInputChange("specialInstructions", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="pickup-scheduled">
                  Pickup Schedule (Optional)
                </Label>
                <Input
                  id="pickup-scheduled"
                  type="datetime-local"
                  value={formData.pickupScheduledAt}
                  onChange={(e) =>
                    handleInputChange("pickupScheduledAt", e.target.value)
                  }
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Leave empty for standard pickup scheduling
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Status
                  </div>
                  <div className="font-medium">{parcel?.status}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Created
                  </div>
                  <div className="text-sm">
                    {parcel && new Date(parcel.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </div>
                  <div className="text-sm">
                    {parcel && new Date(parcel.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Cost Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Cost</span>
                  <span>${parcel?.baseCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Weight Fee</span>
                  <span>${parcel?.weightCost}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${parcel?.totalCost}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Note: Changing the delivery location may affect the total cost.
                New quote will be calculated upon saving.
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="w-full btn-primary"
              >
                {isSaving ? (
                  <>
                    <Edit className="w-4 h-4 mr-2 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(`/parcels/${id}`)}
                className="w-full"
              >
                Cancel Editing
              </Button>

              {!hasChanges && (
                <p className="text-xs text-center text-muted-foreground">
                  No changes to save
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Cancel Parcel
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel parcel {parcel?.trackingNumber}?
              This action cannot be undone and any fees paid may not be
              refundable.
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
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <X className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancel Parcel
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
