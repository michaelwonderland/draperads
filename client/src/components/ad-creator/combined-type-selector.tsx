import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface CombinedTypeSelectorProps {
  onTypeChange: (adType: string) => void;
  onFormatChange: (adFormat: string) => void;
  defaultType?: string;
  defaultFormat?: string;
}

export function CombinedTypeSelector({
  onTypeChange,
  onFormatChange,
  defaultType = "conversions",
  defaultFormat = "image"
}: CombinedTypeSelectorProps) {
  const [adType, setAdType] = useState(defaultType);
  const [adFormat, setAdFormat] = useState(defaultFormat);

  const handleTypeChange = (value: string) => {
    setAdType(value);
    onTypeChange(value);
  };

  const handleFormatChange = (value: string) => {
    setAdFormat(value);
    onFormatChange(value);
  };

  return (
    <div className="space-y-6">
      {/* Ad Type Selection */}
      <div>
        <h3 className="text-base font-medium mb-3">Ad Type</h3>
        
        <RadioGroup
          defaultValue={adType}
          className="flex flex-wrap gap-2"
          onValueChange={handleTypeChange}
        >
          <div className="flex items-center">
            <RadioGroupItem value="conversions" id="conversions" className="sr-only peer" />
            <Label 
              htmlFor="conversions" 
              className="px-4 py-2 border rounded-md cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground hover:bg-muted transition-colors"
            >
              Conversions
            </Label>
          </div>
          
          <div className="flex items-center">
            <RadioGroupItem value="leads" id="leads" className="sr-only peer" />
            <Label 
              htmlFor="leads" 
              className="px-4 py-2 border rounded-md cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground hover:bg-muted transition-colors"
            >
              Leads
            </Label>
          </div>
          
          <div className="flex items-center">
            <RadioGroupItem value="reach" id="reach" className="sr-only peer" />
            <Label 
              htmlFor="reach" 
              className="px-4 py-2 border rounded-md cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground hover:bg-muted transition-colors"
            >
              Reach
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Ad Format Selection */}
      <div>
        <h3 className="text-base font-medium mb-3">Ad Format</h3>
        
        <RadioGroup
          defaultValue={adFormat}
          className="flex flex-wrap gap-2"
          onValueChange={handleFormatChange}
        >
          <div className="flex items-center">
            <RadioGroupItem value="image" id="image" className="sr-only peer" />
            <Label 
              htmlFor="image" 
              className="px-4 py-2 border rounded-md cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground hover:bg-muted transition-colors"
            >
              Image/Video
            </Label>
          </div>
          
          <div className="flex items-center">
            <RadioGroupItem value="carousel" id="carousel" className="sr-only peer" />
            <Label 
              htmlFor="carousel" 
              className="px-4 py-2 border rounded-md cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground hover:bg-muted transition-colors"
            >
              Carousel
            </Label>
          </div>
          
          <div className="flex items-center">
            <RadioGroupItem value="collection" id="collection" className="sr-only peer" />
            <Label 
              htmlFor="collection" 
              className="px-4 py-2 border rounded-md cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground hover:bg-muted transition-colors"
            >
              Collection
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}