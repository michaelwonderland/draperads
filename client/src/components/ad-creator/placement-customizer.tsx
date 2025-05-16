import { useState, useEffect, useRef } from "react";
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { ChevronDown, Maximize2, Clock, Upload, Crop, RefreshCcw, X, Check } from "lucide-react";

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
  onMediaUpdate?: (placementId: string, mediaUrl: string) => void;
}

export function PlacementCustomizer({ 
  mediaUrl, 
  enabled, 
  onToggleCustomization,
  onMediaUpdate
}: PlacementCustomizerProps) {
  // References for file upload inputs
  const fileInputRefs = {
    feeds: useRef<HTMLInputElement>(null),
    stories: useRef<HTMLInputElement>(null),
    rightColumn: useRef<HTMLInputElement>(null)
  };
  
  const [placementMedia, setPlacementMedia] = useState({
    feeds: mediaUrl,
    stories: mediaUrl,
    rightColumn: mediaUrl
  });
  
  const [placementDimensions, setPlacementDimensions] = useState<{
    [key: string]: MediaDimensions | null
  }>({
    feeds: null,
    stories: null,
    rightColumn: null
  });
  
  const [mediaDimensions, setMediaDimensions] = useState<MediaDimensions | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [activeEditPlacement, setActiveEditPlacement] = useState<string | null>(null);
  
  // States for crop dialog
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [currentCropPlacement, setCurrentCropPlacement] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  
  // Always show the toggle, but only show placement options if enabled AND media is uploaded
  
  // Get image/video dimensions when media changes
  // Update all placement media when main media changes
  useEffect(() => {
    if (mediaUrl) {
      setPlacementMedia({
        feeds: mediaUrl,
        stories: mediaUrl,
        rightColumn: mediaUrl
      });
    }
  }, [mediaUrl]);

  // Get dimensions for the main image/video
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
        const dimensions = {
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration
        };
        setMediaDimensions(dimensions);
        
        // Also set dimensions for all placements initially
        setPlacementDimensions({
          feeds: dimensions,
          stories: dimensions,
          rightColumn: dimensions
        });
      };
      video.src = mediaUrl;
    } else {
      const img = new Image();
      img.onload = () => {
        const dimensions = {
          width: img.width,
          height: img.height
        };
        setMediaDimensions(dimensions);
        
        // Also set dimensions for all placements initially
        setPlacementDimensions({
          feeds: dimensions,
          stories: dimensions,
          rightColumn: dimensions
        });
      };
      img.src = mediaUrl;
    }
  }, [mediaUrl]);
  
  // Handle file selection for a specific placement
  const handleFileSelect = (placementId: string, file: File) => {
    // Only handle image files for now
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const newMediaUrl = e.target.result as string;
        
        // Update the media for the specific placement
        setPlacementMedia(prev => ({
          ...prev,
          [placementId]: newMediaUrl
        }));
        
        // Notify parent component of the media update
        if (onMediaUpdate) {
          onMediaUpdate(placementId, newMediaUrl);
        }
        
        // Get dimensions of the new image
        const img = new Image();
        img.onload = () => {
          const dimensions = {
            width: img.width,
            height: img.height
          };
          
          // Update dimensions for this placement only
          setPlacementDimensions(prev => ({
            ...prev,
            [placementId]: dimensions
          }));
        };
        img.src = newMediaUrl;
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Trigger file upload for the Replace button
  const handleReplace = (placementId: string) => {
    const fileInput = fileInputRefs[placementId as keyof typeof fileInputRefs]?.current;
    if (fileInput) {
      fileInput.click();
    }
  };
  
  // Open crop dialog for a specific placement
  const handleCrop = (placementId: string) => {
    setCurrentCropPlacement(placementId);
    setCropDialogOpen(true);
  };
  
  // Handle save cropped image
  const handleSaveCrop = () => {
    if (croppedImage && currentCropPlacement) {
      // Update the media for the specific placement with cropped image
      setPlacementMedia(prev => ({
        ...prev,
        [currentCropPlacement]: croppedImage
      }));
      
      // Notify parent component of the media update
      if (onMediaUpdate) {
        onMediaUpdate(currentCropPlacement, croppedImage);
      }
      
      // Get dimensions of the cropped image
      const img = new Image();
      img.onload = () => {
        setPlacementDimensions(prev => ({
          ...prev,
          [currentCropPlacement as string]: {
            width: img.width,
            height: img.height
          }
        }));
      };
      img.src = croppedImage;
      
      // Close the dialog
      setCropDialogOpen(false);
      setCroppedImage(null);
    }
  };
  
  // Handle reset crop
  const handleResetCrop = () => {
    setCroppedImage(null);
  };

  const placements: Placement[] = [
    {
      id: "feeds",
      name: "Feeds, In-stream ads for videos and reels",
      description: "Appears in Facebook and Instagram feeds, between posts",
      image: mediaUrl,
      dimensions: "1x1 or 4x5"
    },
    {
      id: "stories",
      name: "Stories and Reels, Apps and sites",
      description: "Full-screen vertical format for Stories and Reels",
      image: mediaUrl,
      dimensions: "9x16 or 4x5"
    },
    {
      id: "rightColumn",
      name: "Right column, Search results",
      description: "Appears in the right column on Facebook desktop",
      image: mediaUrl,
      dimensions: "1x1 or 4x5"
    }
  ];

  // Display format for media dimensions
  const formatDimensions = (width?: number, height?: number): string => {
    if (!width || !height) return '';
    
    // Calculate aspect ratio and determine if it matches standard ratios
    let ratioText = "";
    if (width && height) {
      const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
      const divisor = gcd(width, height);
      const simpleRatioW = width / divisor;
      const simpleRatioH = height / divisor;
      
      // Check if it closely matches common aspect ratios
      const ratio = width / height;
      
      if (Math.abs(ratio - 1) < 0.05) {
        ratioText = " (1:1)";
      } else if (Math.abs(ratio - 4/5) < 0.05) {
        ratioText = " (4:5)";
      } else if (Math.abs(ratio - 9/16) < 0.05) {
        ratioText = " (9:16)";
      } else if (simpleRatioW <= 20 && simpleRatioH <= 20) {
        // Only show if the reduced ratio has reasonable numbers
        ratioText = ` (${simpleRatioW}:${simpleRatioH})`;
      }
    }
    
    return `${width} × ${height} px${ratioText}`;
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

  // Modify the placements array to use custom media for each placement
  placements.forEach(placement => {
    placement.image = placementMedia[placement.id as keyof typeof placementMedia];
  });

  return (
    <div className="mt-4 border-t pt-4">
      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
            <DialogDescription>
              Drag and adjust to crop your image for this placement.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4">
            <div className="border rounded-md p-1 overflow-hidden bg-gray-50 min-h-[200px] flex items-center justify-center">
              {currentCropPlacement && (
                <div className="relative">
                  <img 
                    src={placementMedia[currentCropPlacement as keyof typeof placementMedia]} 
                    alt="Image to crop" 
                    className="max-w-full max-h-[300px] object-contain"
                  />
                  {/* For a real implementation, we would use a library like react-image-crop here */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                    <p className="text-sm">Cropping interface would be here</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetCrop}
                className="flex items-center gap-1"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Reset Crop
              </Button>
              
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  type="button" 
                  size="sm"
                  className="bg-[#f6242f] hover:opacity-90 text-white flex items-center gap-1"
                  onClick={handleSaveCrop}
                >
                  <Check className="h-3.5 w-3.5" />
                  Save Crop
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
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
                          <div className="text-xs text-gray-500 mt-1 flex flex-col gap-1">
                            <div className="flex items-center">
                              <Maximize2 className="h-3 w-3 mr-1 inline" />
                              Current: {placementDimensions[placement.id] 
                                ? formatDimensions(placementDimensions[placement.id]!.width, placementDimensions[placement.id]!.height) 
                                : mediaDimensions 
                                  ? formatDimensions(mediaDimensions.width, mediaDimensions.height) 
                                  : 'No media'}
                            </div>
                            <div className="flex items-center">
                              <Maximize2 className="h-3 w-3 mr-1 inline" />
                              Recommended: {placement.dimensions}
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-0">
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500">
                          Optimize your creative for this placement group
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            className="text-xs h-8 bg-[#f6242f] hover:opacity-90 text-white flex items-center gap-1"
                            onClick={() => handleReplace(placement.id)}
                          >
                            <Upload className="h-3 w-3" />
                            Replace
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 flex items-center gap-1"
                            onClick={() => handleCrop(placement.id)}
                          >
                            <Crop className="h-3 w-3" />
                            Crop
                          </Button>
                          
                          {/* Hidden file input for Replace button */}
                          <input
                            type="file"
                            ref={fileInputRefs[placement.id as keyof typeof fileInputRefs]}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileSelect(placement.id, e.target.files[0]);
                              }
                            }}
                          />
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