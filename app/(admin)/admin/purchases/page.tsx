'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Search, Check, Loader2, Ticket } from 'lucide-react';

import { lookupByRedemptionCode, redeemPurchase } from '@/lib/api/shop';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Purchase, ShopItem } from '@/types';
import { ApiClientError } from '@/lib/api/client';

export default function AdminPurchasesPage() {
  const [code, setCode] = useState('');
  const [purchase, setPurchase] = useState<Purchase | null>(null);

  const lookupMutation = useMutation({
    mutationFn: lookupByRedemptionCode,
    onSuccess: (data) => {
      setPurchase(data);
    },
    onError: (error) => {
      toast.error(error instanceof ApiClientError ? error.message : 'Purchase not found');
      setPurchase(null);
    },
  });

  const redeemMutation = useMutation({
    mutationFn: redeemPurchase,
    onSuccess: (data) => {
      toast.success('Purchase redeemed successfully');
      setPurchase(data);
    },
    onError: (error) => {
      toast.error(error instanceof ApiClientError ? error.message : 'Failed to redeem');
    },
  });

  const handleLookup = () => {
    if (!code.trim()) return;
    lookupMutation.mutate(code.trim());
  };

  const itemName = purchase && typeof purchase.itemId === 'object'
    ? (purchase.itemId as ShopItem).name
    : 'Item';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Redemptions</h1>
        <p className="text-muted-foreground">Look up and redeem purchases</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lookup Redemption Code</CardTitle>
          <CardDescription>
            Enter a redemption code to view purchase details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter redemption code..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              className="max-w-md"
            />
            <Button onClick={handleLookup} disabled={lookupMutation.isPending}>
              {lookupMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Lookup
            </Button>
          </div>
        </CardContent>
      </Card>

      {purchase && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Purchase Details</CardTitle>
              <Badge variant={purchase.isRedeemed ? 'secondary' : 'default'}>
                {purchase.isRedeemed ? 'Redeemed' : 'Pending'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Item</p>
                <p className="font-medium">{itemName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-medium">{purchase.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="font-medium">{purchase.totalCost} coins</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Purchased</p>
                <p className="font-medium">
                  {format(new Date(purchase.createdAt), 'PPpp')}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-1">Redemption Code</p>
              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {purchase.redemptionCode}
              </code>
            </div>

            {purchase.isRedeemed && purchase.redeemedAt && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">
                    Redeemed on {format(new Date(purchase.redeemedAt), 'PPpp')}
                  </span>
                </div>
              </div>
            )}

            {!purchase.isRedeemed && (
              <div className="flex justify-end">
                <Button
                  onClick={() => redeemMutation.mutate(purchase.id)}
                  disabled={redeemMutation.isPending}
                >
                  {redeemMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Ticket className="mr-2 h-4 w-4" />
                  )}
                  Mark as Redeemed
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
