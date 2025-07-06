import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { IUserTokenPayload } from '../interfaces/user.interface';

/**
 * Generate JWT token for a user
 * @param user User data to include in the token payload
 * @returns Object containing access token and refresh token
 */
export const generateTokens = (user: IUserTokenPayload) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  };

  // Generate access token
  const accessToken = jwt.sign(
    payload,
    config.JWT.SECRET as jwt.Secret,
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    payload,
    config.JWT.REFRESH_SECRET as jwt.Secret,
  );

  return {
    accessToken,
    refreshToken
  };
};

/**
 * Verify a JWT token
 * @param token JWT token to verify
 * @param isRefreshToken Whether this is a refresh token
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string, isRefreshToken = false): IUserTokenPayload | null => {
  try {
    const secret = isRefreshToken ? config.JWT.REFRESH_SECRET : config.JWT.SECRET;
    return jwt.verify(token, secret as jwt.Secret) as IUserTokenPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Generate a new access token using a refresh token
 * @param refreshToken Refresh token
 * @returns New access token or null if refresh token is invalid
 */
export const refreshAccessToken = (refreshToken: string) => {
  const decoded = verifyToken(refreshToken, true);
  
  if (!decoded) {
    return null;
  }
  
  const payload = {
    id: decoded.id,
    username: decoded.username,
    email: decoded.email,
    role: decoded.role
  };
  
  return jwt.sign(
    payload,
    config.JWT.SECRET as jwt.Secret,
  );
};