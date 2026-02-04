import { z } from 'zod';

export const announcementSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title is too long'),
  content: z
    .string()
    .min(1, 'Content is required'),
  isPinned: z.boolean(),
  isPublished: z.boolean(),
});

export type AnnouncementFormData = z.infer<typeof announcementSchema>;
