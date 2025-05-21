declare namespace Express {
  export interface Request {
    user?: {
      githubId: number;
      username: string;
      accessToken: string;
    };
  }
}

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    githubId: number;
    username: string;
    accessToken: string;
  }
} 