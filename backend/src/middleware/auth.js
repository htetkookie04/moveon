/**
 * Authentication middleware - protects routes, attaches user to request
 */
import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../prisma/client.js';

export async function authMiddleware(req, res, next) {
  // Log for debugging in production
  console.log('Auth middleware - cookies:', Object.keys(req.cookies || {}));
  console.log('Auth middleware - headers:', req.headers.authorization ? 'authorization header present' : 'no authorization header');
  
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    console.log('No token found in cookies or headers');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    console.log('Token verification failed');
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || !user.isActive) {
    console.log('User not found or inactive');
    return res.status(401).json({ error: 'User not found or inactive' });
  }

  req.user = user;
  next();
}

/**
 * Admin-only middleware - must be used after authMiddleware
 */
export function adminOnly(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
