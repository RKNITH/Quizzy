import { z } from 'zod';

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username max 20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createRoomSchema = z.object({
  name: z.string().min(3, 'Room name at least 3 characters').max(50, 'Max 50 characters'),
  quizId: z.string().min(1, 'Please select a quiz'),
  maxParticipants: z.number().min(2).max(50).optional(),
});

export const joinRoomSchema = z.object({
  code: z
    .string()
    .length(6, 'Room code must be exactly 6 characters')
    .regex(/^[A-Z0-9]+$/i, 'Invalid room code format'),
});

export const aiQuizSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters').max(100, 'Topic too long'),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).default('mixed'),
  numQuestions: z.number().min(3).max(15).default(10),
});
