import { useState } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface Placement {
  id: string;
  name: string;
  description: string;
  image?: string;
}

interface PlacementCustomizerProps {
  mediaUrl: string;
  enabled: boolean;
  onToggleCustomization: (enabled: boolean) => void;
}

export function PlacementCustomizer({ 
  mediaUrl, 
  enabled, 
  onToggleCustomization 
}: PlacementCustomizerProps) {
  const [placementMedia, setPlacementMedia] = useState({
    feeds: mediaUrl,
    stories: mediaUrl,
    rightColumn: mediaUrl
  });

  // Only show if media is uploaded
  if (!mediaUrl) {
    return null;
  }

  const placements: Placement[] = [
    {
      id: "feeds",
      name: "Feeds, In-stream ads for videos and reels, Search results",
      description: "Appears in Facebook and Instagram feeds, between posts",
      image: mediaUrl
    },
    {
      id: "stories",
      name: "Stories and Reels, Apps and sites",
      description: "Full-screen vertical format for Stories and Reels",
      image: mediaUrl
    },
    {
      id: "rightColumn",
      name: "Right column, Search results",
      description: "Appears in the right column on Facebook desktop",
      image: mediaUrl
    }
  ];

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-4">
        <Label htmlFor="customize-placements" className="text-sm font-medium">
          Customize for different placements
        </Label>
        <Switch 
          id="customize-placements"
          checked={enabled}
          onCheckedChange={onToggleCustomization}
        />
      </div>

      {enabled && (
        <div className="space-y-4">
          <div className="text-xs text-gray-500 mb-2">
            Your ad can appear differently across placement types.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {placements.map((placement) => (
              <div key={placement.id} className="border rounded-md overflow-hidden">
                <div className="flex items-start">
                  <div className="w-16 h-16 mr-2 p-2">
                    {placement.image && (
                      <img 
                        src={placement.image} 
                        alt={placement.name} 
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <div className="p-2 pr-8 flex-1">
                    <h4 className="text-xs font-medium">{placement.name}</h4>
                  </div>
                  <div className="p-2">
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}