'use client';

import Link from 'next/link';
import { Code2, ShoppingBag, Megaphone, Users, Ticket } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const adminSections = [
  {
    title: 'Challenges',
    description: 'Create and manage weekly challenges',
    href: '/admin/challenges',
    icon: Code2,
  },
  {
    title: 'Shop Items',
    description: 'Manage shop items and prices',
    href: '/admin/shop',
    icon: ShoppingBag,
  },
  {
    title: 'Announcements',
    description: 'Post and manage announcements',
    href: '/admin/announcements',
    icon: Megaphone,
  },
  {
    title: 'Users',
    description: 'View users and grant coins',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Redemptions',
    description: 'Manage purchase redemptions',
    href: '/admin/purchases',
    icon: Ticket,
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage the Python Challenge System
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.href} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={section.href}>Manage</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
