import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BrandSettingsProps {
  onBrandChange: (brandSettings: { brandName: string }) => void;
  brandName?: string;
}

export function BrandSettings({ onBrandChange, brandName = "DraperAds" }: BrandSettingsProps) {
  const [name, setName] = useState(brandName);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    onBrandChange({ brandName: newName });
  };

  return (
    <div>
      <h3 className="text-base font-medium mb-2">Brand Settings</h3>
      <div>
        <Label htmlFor="brand_name" className="text-sm font-medium mb-1">Brand Name</Label>
        <Input
          id="brand_name"
          className="w-full focus:ring-[#f6242f] focus:border-[#f6242f]"
          placeholder="Enter your brand name"
          value={name}
          onChange={handleNameChange}
        />
        <p className="text-xs text-gray-500 mt-1">
          For previewing purposes only - actual Facebook Page and Instagram Account will appear on the next step
        </p>
      </div>
    </div>
  );
}
