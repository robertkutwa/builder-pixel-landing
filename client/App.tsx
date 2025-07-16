import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { Navigation } from "./components/ui/navigation";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateParcel from "./pages/CreateParcel";
import ParcelDetails from "./pages/ParcelDetails";
import QuoteCalculator from "./pages/QuoteCalculator";
import NotFound from "./pages/NotFound";
import "./global.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/parcels/new" element={<CreateParcel />} />
              <Route path="/parcels/:id" element={<ParcelDetails />} />

              {/* Placeholder routes - to be implemented */}
              <Route
                path="/parcels"
                element={
                  <PlaceholderPage
                    title="My Parcels"
                    description="View and manage your parcel deliveries"
                    actionText="Go to Dashboard"
                    actionPath="/dashboard"
                  />
                }
              />
              <Route
                path="/quote"
                element={
                  <PlaceholderPage
                    title="Get Quote"
                    description="Calculate delivery costs for your parcel"
                    actionText="Create Shipment"
                    actionPath="/parcels/new"
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  <PlaceholderPage
                    title="Profile"
                    description="Manage your account settings"
                    actionText="Back to Dashboard"
                    actionPath="/dashboard"
                  />
                }
              />
              <Route
                path="/settings"
                element={
                  <PlaceholderPage
                    title="Settings"
                    description="Configure your preferences"
                    actionText="Back to Dashboard"
                    actionPath="/dashboard"
                  />
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Placeholder component for routes to be implemented later
function PlaceholderPage({
  title,
  description,
  actionText = "Back",
  actionPath = "/",
}: {
  title: string;
  description: string;
  actionText?: string;
  actionPath?: string;
}) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-xl text-muted-foreground mb-8">{description}</p>
        <div className="bg-muted/50 border-2 border-dashed border-muted-foreground/20 rounded-lg p-16 mb-8">
          <div className="text-muted-foreground">
            <div className="text-6xl mb-4">🚧</div>
            <div className="text-lg font-medium mb-2">Coming Soon</div>
            <div className="text-sm mb-4">This page is under development</div>
            <p className="text-sm">
              For now, you can use the main dashboard and parcel creation
              features.
            </p>
          </div>
        </div>
        <a href={actionPath}>
          <button className="btn-primary px-6 py-3 rounded-lg font-medium transition-colors bg-primary hover:bg-primary/90 text-primary-foreground">
            {actionText}
          </button>
        </a>
      </div>
    </div>
  );
}

export default App;
