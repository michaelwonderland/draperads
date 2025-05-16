import { useState } from "react";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Megaphone, Users, Target } from "lucide-react";

interface AdTypeData {
  adType: string;
  customizePlacements: boolean;
}

interface AdTypeSelectorProps {
  onChange: (data: AdTypeData) => void;
  defaultValues?: Partial<AdTypeData>;
}

export function AdTypeSelector({ 
  onChange, 
  defaultValues = { 
    adType: "standard_conversion",
    customizePlacements: false
  } 
}: AdTypeSelectorProps) {
  const [adType, setAdType] = useState(defaultValues.adType || "standard_conversion");
  const [customizePlacements, setCustomizePlacements] = useState(defaultValues.customizePlacements || false);

  const handleAdTypeChange = (value: string) => {
    setAdType(value);
    onChange({
      adType: value,
      customizePlacements
    });
  };

  const handleCustomizePlacementsChange = (checked: boolean) => {
    setCustomizePlacements(checked);
    onChange({
      adType,
      customizePlacements: checked
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Ad Type</h3>
        <RadioGroup 
          value={adType} 
          onValueChange={handleAdTypeChange}
          className="flex flex-wrap gap-3"
        >
          <div>
            <RadioGroupItem 
              value="standard_conversion" 
              id="standard_conversion" 
              className="sr-only" 
            />
            <Label 
              htmlFor="standard_conversion"
              className="cursor-pointer"
            >
              <div className={`px-4 py-2 flex items-center gap-2 rounded-md border ${adType === "standard_conversion" ? "border-[#f6242f] bg-red-50" : "border-gray-200"}`}>
                <Target className="h-4 w-4 text-[#f6242f]" />
                <span className="text-sm font-medium">Standard Conversion</span>
              </div>
            </Label>
          </div>

          <div>
            <RadioGroupItem 
              value="lead_generation" 
              id="lead_generation" 
              className="sr-only" 
            />
            <Label 
              htmlFor="lead_generation"
              className="cursor-pointer"
            >
              <div className={`px-4 py-2 flex items-center gap-2 rounded-md border ${adType === "lead_generation" ? "border-[#f6242f] bg-red-50" : "border-gray-200"}`}>
                <Users className="h-4 w-4 text-[#f6242f]" />
                <span className="text-sm font-medium">Lead Generation</span>
              </div>
            </Label>
          </div>

          <div>
            <RadioGroupItem 
              value="reach" 
              id="reach" 
              className="sr-only" 
            />
            <Label 
              htmlFor="reach"
              className="cursor-pointer"
            >
              <div className={`px-4 py-2 flex items-center gap-2 rounded-md border ${adType === "reach" ? "border-[#f6242f] bg-red-50" : "border-gray-200"}`}>
                <Megaphone className="h-4 w-4 text-[#f6242f]" />
                <span className="text-sm font-medium">Reach</span>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>


    </div>
  );
}