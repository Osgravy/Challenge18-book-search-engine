import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { GraphQLError } from 'graphql';

dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string;
}

// Updated to work with GraphQL context
import { Request } from 'express';

export const authMiddleware = async ({ req }: { req: Request }) => {
  // Get the token from the authorization header
  let token = req.headers.authorization || '';

  // Extract the token if it's in the "Bearer <token>" format
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trim();
  }

  // If no token, throw an authentication error
  if (!token) {
    throw new GraphQLError('You must be logged in to perform this action', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
  }

  try {
    // Verify the token
    const secretKey = process.env.JWT_SECRET_KEY || '';
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    
    // Return the user data to be used in resolvers
    return { user: decoded };
  } catch (err) {
    console.error('Invalid token:', err);
    throw new GraphQLError('Invalid or expired token', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 403 },
      },
    });
  }
};

// Updated signToken function (similar to original but typed)
export const signToken = (username: string, email: string, _id: unknown): string => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';
  
  return jwt.sign(
    { data: payload }, // Wrap payload in data object for consistency
    secretKey,
    { expiresIn: '2h' } // Increased expiration time
  );
};