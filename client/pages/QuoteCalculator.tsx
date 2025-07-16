import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
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
  Calculator,
  Package,
  MapPin,
  DollarSign,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Truck,
} from "lucide-react";
import {
  QuoteRequest,
  QuoteResponse,
  ApiResponse,
  WeightCategory,
} from "@shared/api";
import { cn } from "../lib/utils";

export default function QuoteCalculator() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);

  const [formData, setFormData] = useState<QuoteRequest>({
    pickupLocation: {
      latitude: 40.7128,
      longitude: -74.006,
      city: "",
      state: "",
    },
    deliveryLocation: {
      latitude: 40.7589,
      longitude: -73.9851,
      city: "",
      state: "",
    },
    size: {
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
    },
    value: 0,
  });

  const weightCategories = [
    {
      value: "light",
      label: "Light (0-2kg)",
      description: "Documents, small items",
    },
    {
      value: "medium",
      label: "Medium (2-10kg)",
      description: "Electronics, books",
    },
    {
      value: "heavy",
      label: "Heavy (10-30kg)",
      description: "Appliances, furniture",
    },
    {
      value: "extra_heavy",
      label: "Extra Heavy (30-100kg)",
      description: "Large furniture, machinery",
    },
  ];

  const popularRoutes = [
    { from: "New York, NY", to: "Boston, MA", distance: "306 km" },
    { from: "Los Angeles, CA", to: "San Francisco, CA", distance: "614 km" },
    { from: "Chicago, IL", to: "Detroit, MI", distance: "459 km" },
    { from: "Miami, FL", to: "Orlando, FL", distance: "383 km" },
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof QuoteRequest],
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

      // Basic validation
      if (!formData.pickupLocation.city || !formData.deliveryLocation.city) {
        setError("Please fill in pickup and delivery cities");
        return;
      }

      if (formData.size.weight <= 0) {
        setError("Please enter a valid weight");
        return;
      }

      const response = await fetch("/api/parcels/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse<QuoteResponse> = await response.json();

      if (data.success && data.data) {
        setQuote(data.data);
      } else {
        setError(data.error || "Failed to calculate quote");
      }
    } catch (error) {
      setError("Failed to calculate quote. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const proceedToShipping = () => {
    if (user) {
      // Navigate to create parcel with pre-filled data
      navigate("/parcels/new", {
        state: {
          preFilledData: {
            size: formData.size,
            value: formData.value,
            pickupLocation: {
              ...formData.pickupLocation,
              address: "",
              postalCode: "",
              country: "USA",
            },
            deliveryLocation: {
              ...formData.deliveryLocation,
              address: "",
              postalCode: "",
              country: "USA",
            },
          },
        },
      });
    } else {
      navigate("/register");
    }
  };

  const getWeightCategory = (weight: number): WeightCategory => {
    if (weight <= 2) return "light";
    if (weight <= 10) return "medium";
    if (weight <= 30) return "heavy";
    return "extra_heavy";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Shipping Quote Calculator</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get instant shipping quotes for your parcels. Fast, accurate pricing
          with no hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quote Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>Calculate Your Quote</span>
              </CardTitle>
              <CardDescription>
                Enter your shipment details to get an instant quote
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Locations */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium">Shipping Route</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pickup-city">From (City)</Label>
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
                    <Label htmlFor="pickup-state">State</Label>
                    <Input
                      id="pickup-state"
                      placeholder="NY"
                      value={formData.pickupLocation.state}
                      onChange={(e) =>
                        handleInputChange(
                          "pickupLocation.state",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="delivery-city">To (City)</Label>
                    <Input
                      id="delivery-city"
                      placeholder="Boston"
                      value={formData.deliveryLocation.city}
                      onChange={(e) =>
                        handleInputChange(
                          "deliveryLocation.city",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery-state">State</Label>
                    <Input
                      id="delivery-state"
                      placeholder="MA"
                      value={formData.deliveryLocation.state}
                      onChange={(e) =>
                        handleInputChange(
                          "deliveryLocation.state",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="font-medium">Package Details</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="length">Length (cm)</Label>
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
                    <Label htmlFor="width">Width (cm)</Label>
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
                    <Label htmlFor="height">Height (cm)</Label>
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
                    <Label htmlFor="weight">Weight (kg)</Label>
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

                <div>
                  <Label htmlFor="value">Package Value (USD)</Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.value || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "value",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>

                {formData.size.weight > 0 && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium">Weight Category</div>
                    <Badge variant="secondary" className="mt-1">
                      {getWeightCategory(formData.size.weight)
                        .replace("_", " ")
                        .toUpperCase()}
                    </Badge>
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={calculateQuote}
                disabled={isLoading}
                className="w-full btn-primary"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating Quote...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Get Quote
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results and Info */}
        <div className="space-y-6">
          {/* Quote Results */}
          {quote && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Your Shipping Quote</span>
                </CardTitle>
                <CardDescription>
                  Instant pricing for your shipment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {quote.distance} km
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Distance
                    </div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {quote.estimatedDeliveryTime}h
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Delivery Time
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Base shipping cost</span>
                    <span>${quote.baseCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight category fee</span>
                    <span>${quote.weightCost}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Cost</span>
                    <span className="text-2xl font-bold text-primary">
                      ${quote.totalCost}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={proceedToShipping}
                    className="w-full btn-primary"
                    size="lg"
                  >
                    {user ? (
                      <>
                        <Package className="w-4 h-4 mr-2" />
                        Ship This Package
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Sign Up to Ship
                      </>
                    )}
                  </Button>

                  {!user && (
                    <p className="text-xs text-center text-muted-foreground">
                      Already have an account?{" "}
                      <button
                        onClick={() => navigate("/login")}
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weight Categories Info */}
          <Card>
            <CardHeader>
              <CardTitle>Weight Categories</CardTitle>
              <CardDescription>
                Understanding our pricing structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weightCategories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{category.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {category.description}
                      </div>
                    </div>
                    <div className="text-primary font-semibold">
                      $
                      {category.value === "light"
                        ? "5"
                        : category.value === "medium"
                          ? "12"
                          : category.value === "heavy"
                            ? "25"
                            : "50"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Routes */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Routes</CardTitle>
              <CardDescription>Common shipping destinations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularRoutes.map((route, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      const [fromCity, fromState] = route.from.split(", ");
                      const [toCity, toState] = route.to.split(", ");
                      handleInputChange("pickupLocation.city", fromCity);
                      handleInputChange("pickupLocation.state", fromState);
                      handleInputChange("deliveryLocation.city", toCity);
                      handleInputChange("deliveryLocation.state", toState);
                    }}
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {route.from} → {route.to}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {route.distance}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
