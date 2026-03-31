import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

/*
   JWT Payload interface
   Defines the structure of data encoded in JWT tokens
 */
interface TokenPayload extends JwtPayload {
    userId: number;
    email: string;
}

//validate required environment variables
const validateSecrets = (): void => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }
};

// Validate secrets on module load
validateSecrets();

const JWT_SECRET: Secret = process.env.JWT_SECRET as Secret;
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET as Secret;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcryptjs.genSalt(10);
    return bcryptjs.hash(password, salt);
};

// Compare password
export const comparePassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    return bcryptjs.compare(password, hashedPassword);
};

// Generate Access Token
export const generateAccessToken = (userId: number, email: string): string => {
    return jwt.sign({ userId, email }, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
};

// Generate Refresh Token
export const generateRefreshToken = (userId: number, email: string): string => {
    return jwt.sign({ userId, email }, JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });
};

// Verify Access Token
export const verifyAccessToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
        console.error('Access token verification failed:', error instanceof Error ? error.message : String(error));
        return null;
    }
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
    } catch (error) {
        console.error('Refresh token verification failed:', error instanceof Error ? error.message : String(error));
        return null;
    }
};

// Generate both tokens
export const generateTokens = (userId: number, email: string): { accessToken: string; refreshToken: string } => {
    const accessToken = generateAccessToken(userId, email);
    const refreshToken = generateRefreshToken(userId, email);
    return { accessToken, refreshToken };
};
