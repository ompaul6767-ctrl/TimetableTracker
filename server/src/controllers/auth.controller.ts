import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { loginUser, refreshUserTokens, logoutUser } from '../services/auth.service';
import { prisma } from '../lib/prisma';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const isProd = process.env.NODE_ENV === 'production';
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await loginUser(email, password);

    // Set refresh token as httpOnly cookie
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

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    const tokens = await refreshUserTokens(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

    res.json({ success: true, data: { accessToken: tokens.accessToken } });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    await logoutUser(refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
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
            employeeCode: true,
            designation: true,
            department: { select: { name: true, code: true } },
          },
        },
        coordinatorDepartments: {
          select: {
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
