
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  loginUser,
  refreshUserTokens,
  logoutUser,
  registerFaculty,
} from '../services/auth.service';
import { prisma } from '../lib/prisma';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  prn: z.string().trim().min(1, 'PRN is required'),
  email: z.string().trim().email('Invalid email format'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
});

const isProd = process.env.NODE_ENV === 'production';

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// FACULTY REGISTRATION
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    const user = await registerFaculty(data);

    res.status(201).json({
      success: true,
      data: user,
      message: 'Faculty registration successful',
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await loginUser(email, password);

    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

// REFRESH TOKEN
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    const tokens = await refreshUserTokens(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

    res.json({
      success: true,
      data: { accessToken: tokens.accessToken },
    });
  } catch (error) {
    next(error);
  }
};

// LOGOUT
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    await logoutUser(refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// GET CURRENT USER
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        faculty: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            prn: true,
            designation: true,
            department: {
              select: { name: true, code: true },
            },
          },
        },
        coordinatorDepartments: {
          select: {
            department: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
