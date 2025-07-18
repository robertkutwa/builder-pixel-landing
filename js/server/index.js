import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";
import { handleRegister, handleLogin, handleGetProfile, requireAuth, requireRole, } from "./routes/auth.js";
import { handleGetQuote, handleCreateParcel, handleGetParcels, handleGetParcel, handleUpdateParcelStatus, handleCancelParcel, } from "./routes/parcels.js";
export function createServer() {
    const app = express();
    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // API ping endpoint
    app.get("/api/ping", (_req, res) => {
        res.json({ message: "Deliveroo API v1.0 - Ready for courier services!" });
    });
    // Demo endpoint
    app.get("/api/demo", handleDemo);
    // Authentication routes
    app.post("/api/auth/register", handleRegister);
    app.post("/api/auth/login", handleLogin);
    app.get("/api/auth/profile", requireAuth, handleGetProfile);
    // Parcel routes
    app.post("/api/parcels/quote", handleGetQuote);
    app.post("/api/parcels", requireAuth, handleCreateParcel);
    app.get("/api/parcels", requireAuth, handleGetParcels);
    app.get("/api/parcels/:id", requireAuth, handleGetParcel);
    app.put("/api/parcels/:id/status", requireAuth, requireRole(["admin", "courier"]), handleUpdateParcelStatus);
    app.delete("/api/parcels/:id", requireAuth, handleCancelParcel);
    return app;
}
