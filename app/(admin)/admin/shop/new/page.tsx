import { ShopItemForm } from '@/components/admin/shop-item-form';

export default function NewShopItemPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Shop Item</h1>
        <p className="text-muted-foreground">Add a new item to the shop</p>
      </div>
      <ShopItemForm />
    </div>
  );
}
