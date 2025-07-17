import React, { useState, useRef, useEffect } from "react";
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
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  Package,
  MapPin,
  DollarSign,
  Calculator,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

import { cn } from "../lib/utils";

export default function CreateParcel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const authenticatedFetch = useAuthenticatedFetch();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quote, setQuote] = useState(null);

  const [formData, setFormData] = useState({
    description: "",
    value: 0,
    size: {
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
    },
    specialInstructions: "",
    pickupLocation: {
      latitude: 40.7128,
      longitude: -74.006,
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "USA",
    },
    deliveryLocation: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "USA",
    },
  });

  const steps = [
    { id: 1, title: "Package Details", description: "What are you shipping?" },
    { id: 2, title: "Pickup Location", description: "Where to collect from?" },
    { id: 3, title: "Delivery Location", description: "Where to deliver to?" },
    { id: 4, title: "Review & Quote", description: "Confirm your shipment" },
  ];

  const weightCategories = [
    { value: "light", label: "Light (0-2kg)", price: 5 },
    { value: "medium", label: "Medium (2-10kg)", price: 12 },
    { value: "heavy", label: "Heavy (10-30kg)", price: 25 },
    { value: "extra_heavy", label: "Extra Heavy (30-100kg)", price: 50 },
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateParcelRequest] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const calculateQuote = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const quoteRequest: QuoteRequest = {
        pickupLocation: {
          latitude: formData.pickupLocation.latitude,
          longitude: formData.pickupLocation.longitude,
          city: formData.pickupLocation.city,
          state: formData.pickupLocation.state,
        },
        deliveryLocation: {
          latitude: formData.deliveryLocation.latitude,
          longitude: formData.deliveryLocation.longitude,
          city: formData.deliveryLocation.city,
          state: formData.deliveryLocation.state,
        },
        size: formData.size,
        value: formData.value,
      };

      const response = await fetch("/api/parcels/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quoteRequest),
      });

      const data: ApiResponse<QuoteResponse> = await response.json();

      if (data.success && data.data) {
        setQuote(data.data);
      } else {
        setError(data.error || "Failed to calculate quote");
      }
    } catch (error) {
      setError("Failed to calculate quote");
    } finally {
      setIsLoading(false);
    }
  };

  const submitParcel = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authenticatedFetch("/api/parcels", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        navigate("/dashboard");
      } else {
        setError(data.error || "Failed to create parcel");
      }
    } catch (error) {
      setError("Failed to create parcel");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 3) {
      calculateQuote();
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.description &&
          formData.value > 0 &&
          formData.size.weight > 0 &&
          formData.size.length > 0 &&
          formData.size.width > 0 &&
          formData.size.height > 0
        );
      case 2:
        return (
          formData.pickupLocation.address &&
          formData.pickupLocation.city &&
          formData.pickupLocation.state &&
          formData.pickupLocation.postalCode
        );
      case 3:
        return (
          formData.deliveryLocation.address &&
          formData.deliveryLocation.city &&
          formData.deliveryLocation.state &&
          formData.deliveryLocation.postalCode
        );
      case 4:
        return quote !== null;
      default:
        return false;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">
          Please log in to create a parcel
        </h1>
        <Button onClick={() => navigate("/login")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Shipment</h1>
          <p className="text-muted-foreground">
            Ship your parcel with real-time tracking
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center flex-1",
                index < steps.length - 1 && "relative",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2",
                  currentStep >= step.id
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground text-muted-foreground",
                )}
              >
                {currentStep > step.id ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">
                  {step.description}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2 ml-5",
                    currentStep > step.id ? "bg-primary" : "bg-muted",
                  )}
                  style={{ width: "calc(100% - 2.5rem)" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {steps[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Package Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Package Description *</Label>
                <Input
                  id="description"
                  placeholder="What are you shipping? (e.g., Electronics, Documents)"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Package Value (USD) *</Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.value || ""}
                  onChange={(e) =>
                    handleInputChange("value", parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div className="space-y-4">
                <Label>Package Dimensions *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="length" className="text-sm">
                      Length (cm)
                    </Label>
                    <Input
                      id="length"
                      type="number"
                      min="0"
                      value={formData.size.length || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "size.length",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="width" className="text-sm">
                      Width (cm)
                    </Label>
                    <Input
                      id="width"
                      type="number"
                      min="0"
                      value={formData.size.width || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "size.width",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-sm">
                      Height (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      min="0"
                      value={formData.size.height || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "size.height",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight" className="text-sm">
                      Weight (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.size.weight || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "size.weight",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any special handling instructions..."
                  value={formData.specialInstructions}
                  onChange={(e) =>
                    handleInputChange("specialInstructions", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Step 2: Pickup Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">Pickup Address</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="pickup-address">Street Address *</Label>
                  <Input
                    id="pickup-address"
                    placeholder="123 Main Street"
                    value={formData.pickupLocation.address}
                    onChange={(e) =>
                      handleInputChange(
                        "pickupLocation.address",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pickup-city">City *</Label>
                  <Input
                    id="pickup-city"
                    placeholder="New York"
                    value={formData.pickupLocation.city}
                    onChange={(e) =>
                      handleInputChange("pickupLocation.city", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pickup-state">State *</Label>
                  <Input
                    id="pickup-state"
                    placeholder="NY"
                    value={formData.pickupLocation.state}
                    onChange={(e) =>
                      handleInputChange("pickupLocation.state", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pickup-postal">Postal Code *</Label>
                  <Input
                    id="pickup-postal"
                    placeholder="10001"
                    value={formData.pickupLocation.postalCode}
                    onChange={(e) =>
                      handleInputChange(
                        "pickupLocation.postalCode",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pickup-country">Country</Label>
                  <Select
                    value={formData.pickupLocation.country}
                    onValueChange={(value) =>
                      handleInputChange("pickupLocation.country", value)
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
            </div>
          )}

          {/* Step 3: Delivery Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-accent" />
                <span className="font-medium">Delivery Address</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="delivery-address">Street Address *</Label>
                  <Input
                    id="delivery-address"
                    placeholder="456 Business Avenue"
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
                  <Label htmlFor="delivery-city">City *</Label>
                  <Input
                    id="delivery-city"
                    placeholder="New York"
                    value={formData.deliveryLocation.city}
                    onChange={(e) =>
                      handleInputChange("deliveryLocation.city", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="delivery-state">State *</Label>
                  <Input
                    id="delivery-state"
                    placeholder="NY"
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
                  <Label htmlFor="delivery-postal">Postal Code *</Label>
                  <Input
                    id="delivery-postal"
                    placeholder="10019"
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
            </div>
          )}

          {/* Step 4: Review & Quote */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {isLoading && !quote ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mr-2" />
                  <span>Calculating shipping quote...</span>
                </div>
              ) : quote ? (
                <>
                  {/* Quote Summary */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Calculator className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">Shipping Quote</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Distance
                        </div>
                        <div className="font-medium">{quote.distance} km</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Estimated Time
                        </div>
                        <div className="font-medium">
                          {quote.estimatedDeliveryTime} hours
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Base Cost
                        </div>
                        <div className="font-medium">${quote.baseCost}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Weight Fee
                        </div>
                        <div className="font-medium">${quote.weightCost}</div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Cost</span>
                      <span className="text-2xl font-bold text-primary">
                        ${quote.totalCost}
                      </span>
                    </div>
                  </div>

                  {/* Shipment Summary */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Shipment Summary</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Package
                          </div>
                          <div>{formData.description}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Value
                          </div>
                          <div>${formData.value}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Dimensions
                          </div>
                          <div>
                            {formData.size.length} × {formData.size.width} ×{" "}
                            {formData.size.height} cm
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Weight
                          </div>
                          <div>{formData.size.weight} kg</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            From
                          </div>
                          <div className="text-sm">
                            {formData.pickupLocation.address}
                            <br />
                            {formData.pickupLocation.city},{" "}
                            {formData.pickupLocation.state}{" "}
                            {formData.pickupLocation.postalCode}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            To
                          </div>
                          <div className="text-sm">
                            {formData.deliveryLocation.address}
                            <br />
                            {formData.deliveryLocation.city},{" "}
                            {formData.deliveryLocation.state}{" "}
                            {formData.deliveryLocation.postalCode}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex space-x-4">
          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed() || isLoading}
              className="btn-primary"
            >
              {currentStep === 3 && isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={submitParcel}
              disabled={!canProceed() || isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Shipment...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Create Shipment
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
