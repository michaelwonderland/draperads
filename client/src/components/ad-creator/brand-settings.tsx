import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";

interface BrandSettingsProps {
  onBrandChange: (brandSettings: { brandName: string; brandLogoUrl?: string }) => void;
  brandName?: string;
  brandLogoUrl?: string;
}

export function BrandSettings({ onBrandChange, brandName = "AdCreator", brandLogoUrl }: BrandSettingsProps) {
  const [name, setName] = useState(brandName);
  const [logoUrl, setLogoUrl] = useState(brandLogoUrl);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    onBrandChange({ brandName: newName, brandLogoUrl: logoUrl });
  };

  const handleLogoUpload = (data: { url: string }) => {
    setLogoUrl(data.url);
    onBrandChange({ brandName: name, brandLogoUrl: data.url });
  };

  const handleLogoRemove = () => {
    setLogoUrl(undefined);
    onBrandChange({ brandName: name, brandLogoUrl: undefined });
  };

  const handleLogoSelect = (file: File) => {
    // This is handled by the upload process
  };

  return (
    <div>
      <h3 className="text-base font-medium mb-2">Brand Settings</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="brand_name" className="text-sm font-medium mb-1">Brand Name</Label>
          <Input
            id="brand_name"
            className="w-full focus:ring-[#1877F2] focus:border-[#1877F2]"
            placeholder="Enter your brand name"
            value={name}
            onChange={handleNameChange}
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium mb-1">Brand Logo</Label>
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <div className="h-12 w-12 rounded-md bg-[#F0F2F5] border border-[#E4E6EB] overflow-hidden">
                <img 
                  src={logoUrl} 
                  alt="Brand logo" 
                  className="h-full w-full object-cover" 
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-md bg-[#F0F2F5] border border-[#E4E6EB] flex items-center justify-center text-[#65676B]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              </div>
            )}
            <Button 
              variant="link" 
              className="text-sm text-[#1877F2] hover:underline"
              onClick={() => document.getElementById('logo-upload')?.click()}
            >
              Change Logo
            </Button>
            <FileUpload
              onFileSelect={handleLogoSelect}
              onFileUpload={handleLogoUpload}
              accept="image/*"
              uploadedFileUrl={logoUrl}
              onRemove={handleLogoRemove}
              className="hidden"
            />
          </div>
          <p className="text-xs text-[#65676B] mt-1">Recommended: Square, at least 180 x 180 pixels</p>
        </div>
      </div>
    </div>
  );
}
