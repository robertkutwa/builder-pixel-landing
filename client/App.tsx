import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { Navigation } from "./components/ui/navigation";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Placeholder routes - to be implemented */}
              <Route
                path="/dashboard"
                element={
                  <PlaceholderPage
                    title="Customer Dashboard"
                    description="Manage your parcels and view delivery status"
                  />
                }
              />
              <Route
                path="/admin"
                element={
                  <PlaceholderPage
                    title="Admin Dashboard"
                    description="Manage all parcels and system settings"
                  />
                }
              />
              <Route
                path="/parcels"
                element={
                  <PlaceholderPage
                    title="My Parcels"
                    description="View and manage your parcel deliveries"
                  />
                }
              />
              <Route
                path="/parcels/new"
                element={
                  <PlaceholderPage
                    title="Create New Parcel"
                    description="Schedule a new parcel delivery"
                  />
                }
              />
              <Route
                path="/quote"
                element={
                  <PlaceholderPage
                    title="Get Quote"
                    description="Calculate delivery costs for your parcel"
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  <PlaceholderPage
                    title="Profile"
                    description="Manage your account settings"
                  />
                }
              />
              <Route
                path="/settings"
                element={
                  <PlaceholderPage
                    title="Settings"
                    description="Configure your preferences"
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
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-xl text-muted-foreground mb-8">{description}</p>
        <div className="bg-muted/50 border-2 border-dashed border-muted-foreground/20 rounded-lg p-16">
          <div className="text-muted-foreground">
            <div className="text-6xl mb-4">🚧</div>
            <div className="text-lg font-medium mb-2">Coming Soon</div>
            <div className="text-sm">This page is under development</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
