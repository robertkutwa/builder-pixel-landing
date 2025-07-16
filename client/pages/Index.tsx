import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Truck,
  MapPin,
  Clock,
  Shield,
  Star,
  Package,
  Globe,
  CheckCircle,
  ArrowRight,
  Play,
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: MapPin,
      title: "Real-time Tracking",
      description:
        "Track your parcels in real-time with live location updates and delivery status notifications.",
      color: "text-primary",
    },
    {
      icon: Clock,
      title: "Fast Delivery",
      description:
        "Same-day and next-day delivery options available with accurate time estimates.",
      color: "text-accent",
    },
    {
      icon: Shield,
      title: "Secure & Insured",
      description:
        "All parcels are fully insured and handled with care by our trained couriers.",
      color: "text-success",
    },
    {
      icon: Globe,
      title: "Wide Coverage",
      description:
        "Delivery services available across multiple cities with expanding coverage.",
      color: "text-warning",
    },
  ];

  const stats = [
    { label: "Deliveries Completed", value: "50,000+", icon: Package },
    { label: "Cities Covered", value: "25+", icon: MapPin },
    { label: "Customer Satisfaction", value: "99.5%", icon: Star },
    { label: "Average Delivery Time", value: "2.5hrs", icon: Clock },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      content:
        "Deliveroo has revolutionized our shipping process. Fast, reliable, and excellent tracking!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "E-commerce Manager",
      content:
        "The real-time tracking feature gives our customers complete peace of mind. Highly recommended!",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Regular Customer",
      content:
        "I've used many courier services, but Deliveroo's speed and reliability is unmatched.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Truck className="w-4 h-4 mr-2" />
                  Trusted by 10,000+ customers
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Fast & Reliable
                  <span className="gradient-text block">Courier Services</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Send parcels anywhere, anytime with real-time tracking,
                  competitive pricing, and guaranteed delivery times.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Button
                    size="lg"
                    onClick={() => navigate("/dashboard")}
                    className="btn-primary text-lg px-8 py-6"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={() => navigate("/register")}
                      className="btn-primary text-lg px-8 py-6"
                    >
                      Get Started
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate("/login")}
                      className="text-lg px-8 py-6"
                    >
                      <Play className="mr-2 w-5 h-5" />
                      Watch Demo
                    </Button>
                  </>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-primary">50K+</div>
                  <div className="text-sm text-muted-foreground">
                    Parcels Delivered
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">99.5%</div>
                  <div className="text-sm text-muted-foreground">
                    On-Time Rate
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Image/Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl p-8 lg:p-12">
                <div className="grid grid-cols-1 gap-6">
                  {/* Mock delivery card */}
                  <Card className="shadow-lg border-0 bg-background/80 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-success/10 text-success border-success/20">
                          In Transit
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          DEL-2024-001
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-primary" />
                          <div className="flex-1">
                            <div className="font-medium">From: Tech Street</div>
                            <div className="text-sm text-muted-foreground">
                              New York, NY
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-accent" />
                          <div className="flex-1">
                            <div className="font-medium">To: Business Ave</div>
                            <div className="text-sm text-muted-foreground">
                              New York, NY
                            </div>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Estimated Delivery</span>
                            <span className="font-medium">Today, 2:30 PM</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mock tracking steps */}
                  <div className="space-y-3">
                    {[
                      { step: "Order Placed", completed: true },
                      { step: "Picked Up", completed: true },
                      { step: "In Transit", completed: true, active: true },
                      { step: "Out for Delivery", completed: false },
                      { step: "Delivered", completed: false },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 text-sm"
                      >
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full border-2",
                            item.completed
                              ? "bg-primary border-primary"
                              : "border-muted-foreground/30",
                            item.active && "ring-2 ring-primary/30",
                          )}
                        />
                        <span
                          className={cn(
                            item.completed
                              ? "text-foreground"
                              : "text-muted-foreground",
                            item.active && "font-medium text-primary",
                          )}
                        >
                          {item.step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Choose Deliveroo?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We provide comprehensive courier services with cutting-edge
              technology and exceptional customer service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                      "bg-gradient-to-br from-primary/10 to-accent/10",
                    )}
                  >
                    <feature.icon className={cn("w-6 h-6", feature.color)} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of satisfied customers who trust Deliveroo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-md bg-background">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-warning text-warning"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Ready to Ship Your Next Parcel?
            </h2>
            <p className="text-xl text-white/90">
              Join thousands of customers who trust Deliveroo for their courier
              needs. Fast, reliable, and affordable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate("/parcels/new")}
                  className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90"
                >
                  Create New Parcel
                  <Package className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => navigate("/register")}
                    className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/quote")}
                    className="text-lg px-8 py-6 border-white text-white hover:bg-white/10"
                  >
                    Get a Quote
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
