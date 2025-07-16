import { RequestHandler } from "express";
import { z } from "zod";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  UserRole,
  ApiResponse,
} from "../../shared/api.js";

// Mock database - in production, this would be a real database
interface MockUser extends User {
  password: string;
}

const mockUsers: MockUser[] = [
  {
    id: "admin-1",
    email: "admin@deliveroo.com",
    password: "admin123", // In production, this would be hashed
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    phoneNumber: "+1234567890",
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "customer-1",
    email: "john@example.com",
    password: "password123",
    firstName: "John",
    lastName: "Doe",
    role: "customer",
    phoneNumber: "+1234567891",
    isEmailVerified: true,
    isPhoneVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
  role: z.enum(["customer", "admin", "courier"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Generate a simple JWT-like token (in production, use proper JWT library)
function generateToken(userId: string): string {
  const payload = {
    userId,
    timestamp: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

// Verify token (simplified - in production, use proper JWT verification)
function verifyToken(token: string): { userId: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString());
    if (Date.now() - payload.timestamp > 24 * 60 * 60 * 1000) {
      return null; // Token expired (24 hours)
    }
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === validatedData.email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      } as ApiResponse);
    }

    // Create new user
    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      email: validatedData.email,
      password: validatedData.password, // In production, hash this
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: validatedData.role || "customer",
      phoneNumber: validatedData.phoneNumber,
      isEmailVerified: false,
      isPhoneVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    // Generate token
    const token = generateToken(newUser.id);

    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;

    const response: AuthResponse = {
      user: userWithoutPassword,
      token,
    };

    res.status(201).json({
      success: true,
      data: response,
      message: "User registered successfully",
    } as ApiResponse<AuthResponse>);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        data: error.errors,
      } as ApiResponse);
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user
    const user = mockUsers.find((u) => u.email === validatedData.email);
    if (!user || user.password !== validatedData.password) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      } as ApiResponse);
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    const response: AuthResponse = {
      user: userWithoutPassword,
      token,
    };

    res.status(200).json({
      success: true,
      data: response,
      message: "Login successful",
    } as ApiResponse<AuthResponse>);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        data: error.errors,
      } as ApiResponse);
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};

export const handleGetProfile: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      } as ApiResponse);
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      } as ApiResponse);
    }

    const user = mockUsers.find((u) => u.id === decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      } as ApiResponse);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    } as ApiResponse<User>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};

// Middleware to verify authentication
export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      } as ApiResponse);
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      } as ApiResponse);
    }

    const user = mockUsers.find((u) => u.id === decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      } as ApiResponse);
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};

// Middleware to require specific role
export const requireRole = (roles: UserRole[]) => {
  return (req: any, res: any, next: any) => {
    const user = req.user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
      } as ApiResponse);
    }
    next();
  };
};
