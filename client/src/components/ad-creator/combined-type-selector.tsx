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

  // Common button styles
  const buttonStyle = "px-4 py-2 border rounded-md cursor-pointer transition-colors";
  const selectedStyle = "bg-[#f6242f] text-white border-[#f6242f]";
  const unselectedStyle = "bg-white text-gray-900 hover:bg-gray-50";

  return (
    <div className="space-y-6">
      {/* Ad Type Selection */}
      <div>
        <h3 className="text-base font-medium mb-3">Ad Type</h3>
        
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange("conversions")}
            className={`${buttonStyle} ${adType === "conversions" ? selectedStyle : unselectedStyle}`}
          >
            Conversions
          </button>
          
          <button
            type="button"
            onClick={() => handleTypeChange("leads")}
            className={`${buttonStyle} ${adType === "leads" ? selectedStyle : unselectedStyle}`}
          >
            Leads
          </button>
          
          <button
            type="button"
            onClick={() => handleTypeChange("reach")}
            className={`${buttonStyle} ${adType === "reach" ? selectedStyle : unselectedStyle}`}
          >
            Reach
          </button>
        </div>
      </div>

      {/* Ad Format Selection */}
      <div>
        <h3 className="text-base font-medium mb-3">Ad Format</h3>
        
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleFormatChange("image")}
            className={`${buttonStyle} ${adFormat === "image" ? selectedStyle : unselectedStyle}`}
          >
            Image/Video
          </button>
          
          <button
            type="button"
            onClick={() => handleFormatChange("carousel")}
            className={`${buttonStyle} ${adFormat === "carousel" ? selectedStyle : unselectedStyle}`}
          >
            Carousel
          </button>
          
          <button
            type="button"
            onClick={() => handleFormatChange("collection")}
            className={`${buttonStyle} ${adFormat === "collection" ? selectedStyle : unselectedStyle}`}
          >
            Collection
          </button>
        </div>
      </div>
    </div>
  );
}