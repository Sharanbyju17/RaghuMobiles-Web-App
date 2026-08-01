import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileSpreadsheet, Download } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import * as XLSX from "xlsx";

export function BulkUploadDialog({ onUploaded }: { onUploaded: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { session } = useAuth();

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/v1/inventory/bulk-upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.token}` },
        body: data
      });
      if (res.ok) {
        const json = await res.json();
        alert(json.message);
        setOpen(false);
        setFile(null);
        onUploaded();
      } else {
        const err = await res.json();
        alert(err.detail || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Generate an XLSX template using the xlsx library
    const ws_data = [
      ["Title", "SKU", "Price", "Condition", "Stock", "Category", "Brand", "Description"],
      ["Example iPhone", "IPH12-128-BLK", 50000, "Like New", 10, "Smart Phone", "Apple", "This is an example description"]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    
    // Download the Excel file
    XLSX.writeFile(wb, "inventory_template.xlsx");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <FileSpreadsheet className="h-4 w-4 mr-1.5" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Upload Inventory</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="flex justify-between items-center text-sm bg-surface p-3 rounded-lg border">
            <div>
              <div className="font-medium">Need the template?</div>
              <div className="text-muted-foreground text-xs">Download the Excel template to see required columns.</div>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="h-3 w-3 mr-1" /> Template
            </Button>
          </div>

          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-surface/50">
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              className="hidden" 
              id="excel-upload" 
              onChange={e => e.target.files && setFile(e.target.files[0])} 
            />
            <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                <UploadCloud className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="font-medium text-sm">
                {file ? file.name : "Click to upload Excel file"}
              </div>
              <div className="text-xs text-muted-foreground">Supports .xlsx, .xls</div>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!file || isLoading}>
              {isLoading ? "Uploading..." : "Upload & Process"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
