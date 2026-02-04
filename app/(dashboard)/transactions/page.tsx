'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';

import { getMyTransactions, getTransactionSummary } from '@/lib/api/transactions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { TRANSACTION_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const typeColors: Record<string, string> = {
  LEVEL_UP_REWARD: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  CHALLENGE_BONUS: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  SHOP_PURCHASE: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  ADMIN_GRANT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
};

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', page],
    queryFn: () => getMyTransactions(page, limit),
  });

  const { data: summary } = useQuery({
    queryKey: ['transaction-summary'],
    queryFn: getTransactionSummary,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">
          Your coin transaction history
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{summary.totalEarned}
              </div>
              <div className="text-xs text-muted-foreground mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Level Up Rewards:</span>
                  <span>+{summary.byType.LEVEL_UP_REWARD || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Challenge Bonuses:</span>
                  <span>+{summary.byType.CHALLENGE_BONUS || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Admin Grants:</span>
                  <span>+{summary.byType.ADMIN_GRANT || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {summary.totalSpent}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                On shop purchases
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            <CardTitle>Transaction History</CardTitle>
          </div>
          <CardDescription>
            All your coin transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !transactions?.data.length ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No transactions yet.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.data.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(typeColors[transaction.type])}
                          >
                            {TRANSACTION_TYPE_LABELS[transaction.type] || transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {transaction.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              'font-medium flex items-center justify-end gap-1',
                              transaction.amount > 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            )}
                          >
                            {transaction.amount > 0 ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                            {transaction.amount > 0 ? '+' : ''}
                            {transaction.amount}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {transaction.balance}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(transaction.createdAt), 'PP')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {transactions.meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {transactions.meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= transactions.meta.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
