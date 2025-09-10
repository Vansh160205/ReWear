"use client"
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CSVUploader() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("No file selected");

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('http://localhost:8000/api/admin/upload-csv', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Uploaded ${data.items.length} items`);
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-10 space-y-4">
      <h3 className="text-lg font-medium">Upload Items via CSV</h3>
      <input type="file" ref={fileRef} />
      <Button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </Button>
    </div>
  );
}
