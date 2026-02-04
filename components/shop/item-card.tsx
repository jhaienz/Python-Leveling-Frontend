'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Coins, Lock, ShoppingCart, Loader2, Check, Copy } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { purchaseItem } from '@/lib/api/shop';
import { useAuthStore } from '@/stores/auth-store';
import type { ShopItem } from '@/types';
import { ApiClientError } from '@/lib/api/client';

interface ItemCardProps {
  item: ShopItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState('');
  const [copied, setCopied] = useState(false);

  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const canAfford = user && user.coins >= item.coinPrice;
  const meetsLevelReq = user && user.level >= item.minLevel;
  const canPurchase = canAfford && meetsLevelReq && (item.stock === null || item.stock > 0);

  const purchaseMutation = useMutation({
    mutationFn: () => purchaseItem(item.id),
    onSuccess: (data) => {
      setRedemptionCode(data.purchase.redemptionCode);
      setShowPurchaseDialog(false);
      setShowSuccessDialog(true);
      // Update user coins
      if (user) {
        updateUser({ coins: user.coins - item.coinPrice });
      }
      // Refetch shop items and user profile
      queryClient.invalidateQueries({ queryKey: ['shop-items'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to purchase item');
      }
    },
  });

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(redemptionCode);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          {item.imageUrl && (
            <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden bg-muted">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Coins className="h-3 w-3 text-yellow-500" />
              {item.coinPrice}
            </Badge>
          </div>
          <CardDescription>{item.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-2 text-sm">
            {item.minLevel > 1 && (
              <div className="flex items-center gap-2">
                {meetsLevelReq ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={meetsLevelReq ? '' : 'text-muted-foreground'}>
                  Requires Level {item.minLevel}
                </span>
              </div>
            )}
            {item.stock !== null && (
              <div className="text-muted-foreground">
                {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={!canPurchase}
            onClick={() => setShowPurchaseDialog(true)}
          >
            {!meetsLevelReq ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Level {item.minLevel} Required
              </>
            ) : !canAfford ? (
              'Not Enough Coins'
            ) : item.stock === 0 ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Purchase
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to purchase this item?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-between py-2">
              <span>Item</span>
              <span className="font-medium">{item.name}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Cost</span>
              <span className="font-medium flex items-center gap-1">
                <Coins className="h-4 w-4 text-yellow-500" />
                {item.coinPrice}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-t pt-2">
              <span>Your Balance After</span>
              <span className="font-medium">
                {user ? user.coins - item.coinPrice : 0} coins
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => purchaseMutation.mutate()}
              disabled={purchaseMutation.isPending}
            >
              {purchaseMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Purchase'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog with Redemption Code */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Purchase Successful!
            </DialogTitle>
            <DialogDescription>
              Save your redemption code to claim your reward
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Redemption Code:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm break-all">
                  {redemptionCode}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Present this code to redeem your reward. You can also find it in your purchase history.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
