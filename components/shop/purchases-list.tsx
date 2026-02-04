'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Check, Copy, Ticket } from 'lucide-react';
import { toast } from 'sonner';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Purchase, ShopItem } from '@/types';

interface PurchasesListProps {
  purchases: Purchase[];
}

export function PurchasesList({ purchases }: PurchasesListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!purchases.length) {
    return (
      <div className="text-center py-12">
        <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No purchases yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-center">Qty</TableHead>
            <TableHead className="text-center">Cost</TableHead>
            <TableHead>Redemption Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => {
            const itemName =
              typeof purchase.itemId === 'object'
                ? (purchase.itemId as ShopItem).name
                : 'Item';

            return (
              <TableRow key={purchase.id}>
                <TableCell className="font-medium">{itemName}</TableCell>
                <TableCell className="text-center">{purchase.quantity}</TableCell>
                <TableCell className="text-center">{purchase.totalCost}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {purchase.redemptionCode.slice(0, 8)}...
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(purchase.redemptionCode, purchase.id)}
                    >
                      {copiedId === purchase.id ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {purchase.isRedeemed ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Redeemed
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(purchase.createdAt), 'PP')}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
