'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Coins, ShoppingBag, History } from 'lucide-react';

import { useAuthStore } from '@/stores/auth-store';
import { getShopItems, getMyPurchases } from '@/lib/api/shop';
import { ItemCard } from '@/components/shop/item-card';
import { PurchasesList } from '@/components/shop/purchases-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShopPage() {
  const user = useAuthStore((state) => state.user);

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['shop-items'],
    queryFn: getShopItems,
  });

  const { data: purchases, isLoading: purchasesLoading } = useQuery({
    queryKey: ['my-purchases'],
    queryFn: () => getMyPurchases(1, 50),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Shop</h1>
          <p className="text-muted-foreground">
            Redeem your coins for rewards
          </p>
        </div>
        {user && (
          <Card className="sm:w-auto">
            <CardContent className="flex items-center gap-3 p-4">
              <Coins className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className="text-2xl font-bold">{user.coins}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="shop">
        <TabsList>
          <TabsTrigger value="shop" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Available Items
          </TabsTrigger>
          <TabsTrigger value="purchases" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            My Purchases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shop" className="mt-6">
          {itemsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : !items?.length ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No items available at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="purchases" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>
                View your purchased items and redemption codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {purchasesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <PurchasesList purchases={purchases?.data || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
