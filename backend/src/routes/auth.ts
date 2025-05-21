import { Router } from 'express';
import { Octokit } from '@octokit/rest';
const jwt = require('jsonwebtoken');
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

interface GitHubAuthResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GitHubUser {
  id: number;
  login: string;
  avatar_url?: string;
}

// GitHub OAuth login
router.get('/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo user`;
  res.redirect(githubAuthUrl);
});

// GitHub OAuth callback
router.get('/github/callback', async (req, res, next) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      throw new AppError(400, 'Invalid authorization code');
    }

    // Exchange code for access token
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json() as GitHubAuthResponse;

    if (data.error) {
      throw new AppError(401, data.error_description || 'GitHub authentication failed');
    }

    if (!data.access_token) {
      throw new AppError(401, 'No access token received');
    }

    // Get user info using the access token
    const octokit = new Octokit({ auth: data.access_token });
    const { data: userInfo } = await octokit.users.getAuthenticated();

    // Create JWT token
    const token = jwt.sign(
      {
        githubId: userInfo.id,
        username: userInfo.login,
        accessToken: data.access_token,
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    // In production, you would typically set this as an HTTP-only cookie
    res.json({ token });
  } catch (error) {
    logger.error('GitHub authentication error:', error);
    next(error);
  }
});

export { router as authRouter }; 