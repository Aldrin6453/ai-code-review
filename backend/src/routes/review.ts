import { Router } from 'express';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

if (!process.env.OPENAI_API_KEY) {
  logger.error('OPENAI_API_KEY is not set in environment variables');
  throw new Error('OPENAI_API_KEY is required');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Validation schema for code review request
const reviewRequestSchema = z.object({
  code: z.string().min(1),
  language: z.string(),
  context: z.string().optional(),
});

// Request code review
router.post('/analyze', async (req, res, next) => {
  try {
    const { code, language, context } = reviewRequestSchema.parse(req.body);

    const prompt = `Please review the following ${language} code:
    
${code}

${context ? `Additional context: ${context}` : ''}

Please provide a detailed code review that includes:
1. Code quality assessment
2. Potential bugs or issues
3. Security vulnerabilities
4. Performance considerations
5. Best practices and suggestions for improvement
`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance optimization.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const review = completion.choices[0]?.message?.content;

    if (!review) {
      throw new AppError(500, 'Failed to generate code review');
    }

    res.json({
      status: 'success',
      review
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request data'));
    } else {
      logger.error('Code review error:', error);
      next(error);
    }
  }
});

export { router as reviewRouter }; 