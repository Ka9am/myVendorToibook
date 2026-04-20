import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'toibook-dev-secret-change-me';
const EXPIRES_IN = '6h';

export type JwtPayload = {
  sub: string;
  vendorId?: number;
  role?: 'ADMIN';
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function authFromRequest(req: Request): JwtPayload | null {
  const header = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return verifyToken(token);
}
