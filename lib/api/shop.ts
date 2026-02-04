import { api } from './client';
import type { ShopItem, Purchase, PaginatedResponse } from '@/types';

export async function getShopItems(): Promise<ShopItem[]> {
  return api.get<ShopItem[]>('/shop/items');
}

export interface PurchaseInput {
  quantity?: number;
}

export interface PurchaseResponse {
  message: string;
  purchase: Purchase;
}

export async function purchaseItem(itemId: string, data?: PurchaseInput): Promise<PurchaseResponse> {
  return api.post<PurchaseResponse>(`/shop/purchase/${itemId}`, data || { quantity: 1 });
}

export async function getMyPurchases(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Purchase>> {
  return api.get<PaginatedResponse<Purchase>>(`/shop/purchases?page=${page}&limit=${limit}`);
}

// Admin endpoints
export interface CreateShopItemInput {
  name: string;
  description: string;
  imageUrl?: string;
  coinPrice: number;
  stock?: number;
  minLevel?: number;
  isActive?: boolean;
}

export async function createShopItem(data: CreateShopItemInput): Promise<ShopItem> {
  return api.post<ShopItem>('/shop/items', data);
}

export async function updateShopItem(id: string, data: Partial<CreateShopItemInput>): Promise<ShopItem> {
  return api.patch<ShopItem>(`/shop/items/${id}`, data);
}

export async function deleteShopItem(id: string): Promise<void> {
  return api.delete(`/shop/items/${id}`);
}

export async function lookupByRedemptionCode(code: string): Promise<Purchase> {
  return api.get<Purchase>(`/shop/purchases/code/${code}`);
}

export async function redeemPurchase(purchaseId: string): Promise<Purchase> {
  return api.post<Purchase>(`/shop/purchases/${purchaseId}/redeem`);
}
