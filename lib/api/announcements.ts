import { api } from './client';
import type { Announcement, PaginatedResponse } from '@/types';

export async function getAnnouncements(): Promise<Announcement[]> {
  return api.get<Announcement[]>('/announcements');
}

// Admin endpoints
export async function listAllAnnouncements(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Announcement>> {
  return api.get<PaginatedResponse<Announcement>>(`/announcements/all?page=${page}&limit=${limit}`);
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  isPinned?: boolean;
  isPublished?: boolean;
}

export async function createAnnouncement(data: CreateAnnouncementInput): Promise<Announcement> {
  return api.post<Announcement>('/announcements', data);
}

export async function getAnnouncement(id: string): Promise<Announcement> {
  return api.get<Announcement>(`/announcements/${id}`);
}

export async function updateAnnouncement(id: string, data: Partial<CreateAnnouncementInput>): Promise<Announcement> {
  return api.patch<Announcement>(`/announcements/${id}`, data);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  return api.delete(`/announcements/${id}`);
}

export async function publishAnnouncement(id: string): Promise<Announcement> {
  return api.post<Announcement>(`/announcements/${id}/publish`);
}

export async function unpublishAnnouncement(id: string): Promise<Announcement> {
  return api.post<Announcement>(`/announcements/${id}/unpublish`);
}

export async function togglePin(id: string): Promise<Announcement> {
  return api.post<Announcement>(`/announcements/${id}/toggle-pin`);
}
