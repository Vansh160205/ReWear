'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AddItemPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [size, setSize] = useState('');
  const [condition, setCondition] = useState('');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isRedeemable, setIsRedeemable] = useState(false);
  const [pointsCost, setPointsCost] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('size', size);
      formData.append('condition', condition);
      formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim())));
      formData.append('isRedeemable', String(isRedeemable));
      if (isRedeemable) {
        formData.append('pointsCost', String(pointsCost));
      }

      images.forEach((file) => {
        formData.append('images', file);
      });

      const res = await fetch('http://localhost:8000/api/items', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Item listed successfully!');
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Failed to add item');
      }
    } catch (error) {
      toast.error('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl p-6 bg-muted rounded-xl shadow-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center mb-4">List a New Item</h1>

        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div>
          <Label>Category</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="size">Size</Label>
          <select
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
          >
            <option value="">Select Size</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>
        </div>

        <div>
          <Label>Condition</Label>
          <Input value={condition} onChange={(e) => setCondition(e.target.value)} required />
        </div>

        <div>
          <Label>Tags (comma separated)</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isRedeemable"
            checked={isRedeemable}
            onChange={(e) => setIsRedeemable(e.target.checked)}
          />
          <Label htmlFor="isRedeemable">Allow Redeem via Points</Label>
        </div>

        {isRedeemable && (
          <div>
            <Label>Points Cost</Label>
            <Input
              type="number"
              min={1}
              value={pointsCost}
              onChange={(e) => setPointsCost(Number(e.target.value))}
              required
            />
          </div>
        )}

        <div>
          <Label>Upload Images</Label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Submitting...' : 'Add Item'}
        </Button>
      </form>
    </main>
  );
}
