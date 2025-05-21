import { Router } from 'express';
import { Octokit } from '@octokit/rest';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const repoSchema = z.object({
  owner: z.string(),
  repo: z.string(),
});

const prSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  pull_number: z.number(),
});

const reviewCommentSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  pull_number: z.number(),
  commit_id: z.string(),
  path: z.string(),
  body: z.string(),
  line: z.number(),
});

// Get repository information
router.get('/repos/:owner/:repo', async (req, res, next) => {
  try {
    const { owner, repo } = repoSchema.parse(req.params);
    
    const octokit = new Octokit({ auth: req.headers.authorization?.replace('Bearer ', '') });
    
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    });

    res.json({
      status: 'success',
      data: repoData,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid repository data'));
    } else {
      logger.error('GitHub API error:', error);
      next(error);
    }
  }
});

// Get pull request information
router.get('/repos/:owner/:repo/pulls/:pull_number', async (req, res, next) => {
  try {
    const params = prSchema.parse({
      ...req.params,
      pull_number: parseInt(req.params.pull_number, 10),
    });
    
    const octokit = new Octokit({ auth: req.headers.authorization?.replace('Bearer ', '') });
    
    const { data: prData } = await octokit.pulls.get(params);
    const { data: files } = await octokit.pulls.listFiles(params);

    res.json({
      status: 'success',
      data: {
        pullRequest: prData,
        files,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid pull request data'));
    } else {
      logger.error('GitHub API error:', error);
      next(error);
    }
  }
});

// Create a review comment on a pull request
router.post('/repos/:owner/:repo/pulls/:pull_number/comments', async (req, res, next) => {
  try {
    const params = reviewCommentSchema.parse({
      ...req.params,
      pull_number: parseInt(req.params.pull_number, 10),
      ...req.body,
    });
    
    const octokit = new Octokit({ auth: req.headers.authorization?.replace('Bearer ', '') });
    
    const { data: comment } = await octokit.pulls.createReviewComment({
      ...params,
      position: params.line,
    });

    res.json({
      status: 'success',
      data: comment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid comment data'));
    } else {
      logger.error('GitHub API error:', error);
      next(error);
    }
  }
});

export { router as githubRouter }; 