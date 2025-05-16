import { useState, useEffect } from "react";
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
import { ChevronDown, Maximize2, Clock } from "lucide-react";

interface MediaDimensions {
  width: number;
  height: number;
  duration?: number; // for videos
}

interface Placement {
  id: string;
  name: string;
  description: string;
  image?: string;
  dimensions: string;
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
  
  const [mediaDimensions, setMediaDimensions] = useState<MediaDimensions | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [activeEditPlacement, setActiveEditPlacement] = useState<string | null>(null);
  
  // Always show the toggle, but only show placement options if enabled AND media is uploaded
  
  // Get image/video dimensions when media changes
  useEffect(() => {
    if (!mediaUrl) {
      setMediaDimensions(null);
      return;
    }
    
    const isVideoFile = mediaUrl.match(/\.(mp4|mov|avi|wmv)$/i);
    setIsVideo(!!isVideoFile);
    
    if (isVideoFile) {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        setMediaDimensions({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration
        });
      };
      video.src = mediaUrl;
    } else {
      const img = new Image();
      img.onload = () => {
        setMediaDimensions({
          width: img.width,
          height: img.height
        });
      };
      img.src = mediaUrl;
    }
  }, [mediaUrl]);

  const placements: Placement[] = [
    {
      id: "feeds",
      name: "Feeds, In-stream ads for videos and reels",
      description: "Appears in Facebook and Instagram feeds, between posts",
      image: mediaUrl,
      dimensions: "1:1 (square) - recommended"
    },
    {
      id: "stories",
      name: "Stories and Reels, Apps and sites",
      description: "Full-screen vertical format for Stories and Reels",
      image: mediaUrl,
      dimensions: "9:16 (vertical) - recommended"
    },
    {
      id: "rightColumn",
      name: "Right column, Search results",
      description: "Appears in the right column on Facebook desktop",
      image: mediaUrl,
      dimensions: "4:5 (portrait) - recommended"
    }
  ];

  // Display format for media dimensions
  const formatDimensions = (width?: number, height?: number): string => {
    if (!width || !height) return '';
    return `${width} × ${height} px`;
  };

  // Format video duration in MM:SS format
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEditPlacement = (placementId: string) => {
    setActiveEditPlacement(activeEditPlacement === placementId ? null : placementId);
  };

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

      {/* Media dimensions display - always shown when media is uploaded */}
      {mediaUrl && mediaDimensions && (
        <div className="mb-4 text-xs text-gray-600">
          <div className="flex items-center mb-1">
            <div className="mr-4 flex items-center">
              <Maximize2 className="h-3 w-3 mr-1" />
              {formatDimensions(mediaDimensions.width, mediaDimensions.height)}
            </div>
            {isVideo && mediaDimensions.duration && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDuration(mediaDimensions.duration)}
              </div>
            )}
          </div>
          <div className="text-gray-500 mt-1">
            <span className="font-medium">Recommended:</span> 1x1, 4x5 or 9x16. JPG, PNG (max 30MB), MP4, MOV, GIF (max 4GB)
          </div>
        </div>
      )}

      {/* Scaled preview - always shown when media is uploaded */}
      {mediaUrl && (
        <div className="mb-4 border rounded-md p-2 bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">Media Preview (50% scale)</p>
          <div className="flex justify-center">
            {isVideo ? (
              <video
                src={mediaUrl}
                controls
                className="max-w-full"
                style={{ maxHeight: '200px', width: 'auto', transform: 'scale(0.5)', transformOrigin: 'top left' }}
              />
            ) : (
              <img
                src={mediaUrl}
                alt="Media preview"
                className="max-w-full"
                style={{ maxHeight: '200px', width: 'auto', transform: 'scale(0.5)', transformOrigin: 'top left' }}
              />
            )}
          </div>
        </div>
      )}

      {enabled && mediaUrl && (
        <div className="space-y-4">
          <div className="text-xs text-gray-500 mb-2">
            Your ad can appear differently across placement types.
          </div>

          <div className="space-y-3">
            {placements.map((placement) => (
              <div key={placement.id} className="border rounded-md overflow-hidden">
                <Accordion
                  type="single"
                  collapsible
                  value={activeEditPlacement === placement.id ? placement.id : ''}
                  onValueChange={(value) => setActiveEditPlacement(value || null)}
                >
                  <AccordionItem value={placement.id} className="border-0">
                    <AccordionTrigger className="px-3 py-2 hover:no-underline">
                      <div className="flex items-start w-full">
                        <div className="w-16 h-16 mr-3 bg-gray-100 flex-shrink-0">
                          {placement.image && (
                            <img 
                              src={placement.image} 
                              alt={placement.name} 
                              className="object-cover w-full h-full"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-medium text-left">{placement.name}</h4>
                          <div className="text-xs text-gray-500 mt-1 flex items-center">
                            <Maximize2 className="h-3 w-3 mr-1 inline" />
                            {placement.dimensions}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500">
                          Optimize your creative for this placement.
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            className="text-xs h-8 bg-[#f6242f] hover:opacity-90 text-white"
                          >
                            Upload New Media
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="text-xs h-8"
                          >
                            Edit Crop
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}