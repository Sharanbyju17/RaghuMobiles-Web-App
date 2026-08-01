import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useNavigate } from "@tanstack/react-router";

export type ProductFormData = {
  title: string; brand: string; price: string; originalPrice: string; sku: string; category: string;
  stock: string; color: string; condition: string; description: string; ram: string; storage: string;
};

export function ProductForm({ 
  initialData, 
  productId,
  onSubmitSuccess 
}: { 
  initialData?: Partial<ProductFormData> & { images?: string[], videos?: string[] };
  productId?: string;
  onSubmitSuccess: () => void;
}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();
  
  const [formData, setFormData] = useState<ProductFormData>({
    title: initialData?.title || "", 
    brand: initialData?.brand || "", 
    price: initialData?.price || "", 
    originalPrice: initialData?.originalPrice || "", 
    sku: initialData?.sku || "", 
    category: initialData?.category || "Smart Phone",
    stock: initialData?.stock || "", 
    color: initialData?.color || "", 
    condition: initialData?.condition || "New", 
    description: initialData?.description || "", 
    ram: initialData?.ram || "", 
    storage: initialData?.storage || ""
  });

  // Media state holding either a remote URL or a File object with a local preview URL
  const [media, setMedia] = useState<{url: string, type: string, file?: File}[]>([]);
  
  // Initialize media from existing product data
  useEffect(() => {
    if (initialData) {
      const existingImages = (initialData.images || []).map(url => ({ url, type: 'image' }));
      const existingVideos = (initialData.videos || []).map(url => ({ url, type: 'video' }));
      setMedia([...existingImages, ...existingVideos]);
    }
  }, [initialData]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    if (!e.target.files?.length) return;
    const newMedia = Array.from(e.target.files).map(file => ({
      url: URL.createObjectURL(file), // Local preview
      type,
      file // Keep file to upload on submit
    }));
    setMedia(prev => [...prev, ...newMedia]);
  };

  const removeMedia = (index: number) => {
    setMedia(prev => {
      const newMedia = [...prev];
      if (newMedia[index].file) {
        URL.revokeObjectURL(newMedia[index].url); // Clean up memory
      }
      newMedia.splice(index, 1);
      return newMedia;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 1. Upload any new files first
      const finalMedia = [...media];
      for (let i = 0; i < finalMedia.length; i++) {
        if (finalMedia[i].file) {
          const data = new FormData();
          data.append("file", finalMedia[i].file as File);
          const res = await fetch("http://localhost:8000/api/v1/inventory/upload-media", {
            method: "POST",
            headers: { "Authorization": `Bearer ${session?.token}` },
            body: data
          });
          if (res.ok) {
            const { url } = await res.json();
            finalMedia[i] = { url, type: finalMedia[i].type };
          } else {
            throw new Error("Failed to upload media");
          }
        }
      }

      // 2. Prepare the payload
      const payload = {
        title: formData.title,
        sku: formData.sku,
        condition: formData.condition,
        price: parseFloat(formData.price) || 0,
        stock_quantity: parseInt(formData.stock) || 0,
        description: formData.description,
        brand_id: null,
        category_id: null,
        images: finalMedia.filter(m => m.type === 'image').map(m => m.url),
        videos: finalMedia.filter(m => m.type === 'video').map(m => m.url),
        specifications: {
          original_price: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          brand_name: formData.brand,
          category_name: formData.category,
          color: formData.color,
          ram: formData.ram,
          storage: formData.storage
        }
      };

      // 3. Save or Update Product
      const endpoint = productId 
        ? `http://localhost:8000/api/v1/inventory/products/${productId}`
        : "http://localhost:8000/api/v1/inventory/products";
        
      const method = productId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        onSubmitSuccess();
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to save product");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving product. Please check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const update = (k: keyof typeof formData, v: string) => setFormData(p => ({ ...p, [k]: v }));

  return (
    <form onSubmit={handleSubmit} className="card-soft p-6 md:p-8 space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2">
          <Label>Product Name *</Label>
          <Input required value={formData.title} onChange={e => update("title", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Brand *</Label>
          <Input required value={formData.brand} onChange={e => update("brand", e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Price (₹) *</Label>
          <Input type="number" required value={formData.price} onChange={e => update("price", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Original Price (₹)</Label>
          <Input type="number" value={formData.originalPrice} onChange={e => update("originalPrice", e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>IMEI *</Label>
          <Input required value={formData.sku} onChange={e => update("sku", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Stock *</Label>
          <Input type="number" required value={formData.stock} onChange={e => update("stock", e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <Input value={formData.color} onChange={e => update("color", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Condition</Label>
          <Select value={formData.condition} onValueChange={v => update("condition", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Not Applicable">Not Applicable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Image Upload</Label>
          <div className="flex items-center gap-3">
            <Button type="button" onClick={() => document.getElementById('image-upload')?.click()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Choose Files
            </Button>
            <span className="text-sm text-muted-foreground">{media.filter(m => m.type === 'image').length > 0 ? `${media.filter(m => m.type === 'image').length} file(s) selected` : 'No file chosen'}</span>
            <input id="image-upload" type="file" multiple accept="image/*" className="hidden" onChange={e => handleFileSelect(e, 'image')} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Video Upload</Label>
          <div className="flex items-center gap-3">
            <Button type="button" onClick={() => document.getElementById('video-upload')?.click()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Choose File
            </Button>
            <span className="text-sm text-muted-foreground">{media.filter(m => m.type === 'video').length > 0 ? `${media.filter(m => m.type === 'video').length} file(s) selected` : 'No file chosen'}</span>
            <input id="video-upload" type="file" accept="video/*" className="hidden" onChange={e => handleFileSelect(e, 'video')} />
          </div>
        </div>

        {/* Preview Section */}
        {media.length > 0 && (
          <div className="col-span-1 md:col-span-2">
            <div className="flex flex-wrap gap-4">
              {media.map((m, i) => (
                <div key={i} className="relative h-24 w-24 rounded-lg border bg-surface/50 overflow-hidden group shadow-sm">
                  {m.type === 'image' ? (
                    <img src={m.url} className="w-full h-full object-cover" alt="upload" />
                  ) : (
                    <video src={m.url} className="w-full h-full object-cover" />
                  )}
                  <button type="button" onClick={() => removeMedia(i)} className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={formData.category} onValueChange={v => update("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Smart Phone">Smart Phone</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="hidden md:block col-span-1"></div>

        <div className="space-y-2 col-span-1 md:col-span-2">
          <Label>Description *</Label>
          <Textarea required rows={4} value={formData.description} onChange={e => update("description", e.target.value)} />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-4">Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <Label>RAM</Label>
            <Input placeholder="e.g. 8GB" value={formData.ram} onChange={e => update("ram", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Storage</Label>
            <Input placeholder="e.g. 256GB" value={formData.storage} onChange={e => update("storage", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex justify-start gap-4 pt-6 border-t border-border/60">
        <Button type="submit" size="lg" className="px-8 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90" disabled={isLoading}>
          {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Saving...</> : productId ? "Update Product" : "Add Product"}
        </Button>
        <Button type="button" size="lg" variant="outline" className="px-8 bg-background border-border" onClick={() => navigate({ to: "/admin/inventory" })}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
