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
import EditParcel from "./pages/EditParcel";
import ParcelsPage from "./pages/ParcelsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
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
              <Route path="/parcels" element={<ParcelsPage />} />
              <Route path="/parcels/new" element={<CreateParcel />} />
              <Route path="/parcels/:id" element={<ParcelDetails />} />
              <Route path="/parcels/:id/edit" element={<EditParcel />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/quote" element={<QuoteCalculator />} />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
