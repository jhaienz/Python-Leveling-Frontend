import { z } from 'zod';

export const testCaseSchema = z.object({
  input: z.string().min(1, 'Input is required'),
  expectedOutput: z.string().optional(),
});

export const challengeSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title is too long'),
  description: z
    .string()
    .min(1, 'Description is required'),
  problemStatement: z
    .string()
    .min(1, 'Problem statement is required'),
  starterCode: z.string(),
  testCases: z
    .array(testCaseSchema)
    .min(1, 'At least one test case is required'),
  evaluationPrompt: z.string().optional(),
  difficulty: z
    .number()
    .min(1, 'Difficulty must be between 1-5')
    .max(5, 'Difficulty must be between 1-5'),
  baseXpReward: z
    .number()
    .min(0, 'XP reward must be positive'),
  bonusCoins: z
    .number()
    .min(0, 'Bonus coins must be positive'),
  weekNumber: z.number().optional(),
  year: z.number().optional(),
  isActive: z.boolean(),
});

export type ChallengeFormData = z.infer<typeof challengeSchema>;
