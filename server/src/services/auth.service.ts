import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { generateTokens, saveRefreshToken, verifyRefreshToken, revokeRefreshToken } from './token.service';
import { AuthTokens } from '../types';

export const loginUser = async (email: string, password: string): Promise<AuthTokens & { user: object }> => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
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

  if (!user || !user.isActive) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const tokens = generateTokens(user.id, user.email, user.role);
  await saveRefreshToken(tokens.refreshToken, user.id);

  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      faculty: user.faculty,
      coordinatorDepartments: user.coordinatorDepartments,
    },
  };
};

export const refreshUserTokens = async (refreshToken: string): Promise<AuthTokens> => {
  if (!refreshToken) {
    throw Object.assign(new Error('Refresh token required'), { statusCode: 401 });
  }

  const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
    throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
  }

  const payload = verifyRefreshToken(refreshToken);
  await revokeRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) {
    throw Object.assign(new Error('User not found or inactive'), { statusCode: 401 });
  }

  const tokens = generateTokens(user.id, user.email, user.role);
  await saveRefreshToken(tokens.refreshToken, user.id);

  return tokens;
};

export const logoutUser = async (refreshToken: string): Promise<void> => {
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
};
