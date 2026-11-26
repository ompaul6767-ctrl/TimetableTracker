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
          prn: true,
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

export const registerFaculty = async (data: {
  fullName: string;
  prn: string;
  email: string;
  mobile: string;
  password: string;
}) => {
  const email = data.email.trim().toLowerCase();
  const prn = data.prn.trim();

  // Check whether the email is already registered
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw Object.assign(new Error('Email is already registered'), {
      statusCode: 409,
    });
  }

  // Check whether the PRN is already registered
  const existingFaculty = await prisma.faculty.findUnique({
    where: { prn },
  });

  if (existingFaculty) {
    throw Object.assign(new Error('PRN is already registered'), {
      statusCode: 409,
    });
  }

  // Find the fixed Computer Engineering department
  const department = await prisma.department.findUnique({
    where: { code: 'COMP' },
  });

  if (!department || !department.isActive) {
    throw Object.assign(
      new Error('Computer Engineering department is unavailable'),
      { statusCode: 400 }
    );
  }

  const nameParts = data.fullName.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || '-';

  const passwordHash = await bcrypt.hash(data.password, 10);

  // Create User and Faculty together
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: 'FACULTY',
      faculty: {
        create: {
          firstName,
          lastName,
          prn,
          email,
          phone: data.mobile,
          departmentId: department.id,
        },
      },
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return user;
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
