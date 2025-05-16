import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SmartphoneIcon, MonitorIcon, ThumbsUpIcon, MessageCircleIcon, ShareIcon, MoreHorizontalIcon, GlobeIcon } from "lucide-react";

interface AdPreviewProps {
  brandName: string;
  mediaUrl?: string;
  primaryText: string;
  headline: string;
  description?: string;
  cta: string;
}

export function AdPreview({
  brandName,
  mediaUrl,
  primaryText,
  headline,
  description,
  cta
}: AdPreviewProps) {
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Convert CTA code to display text
  const getCtaText = (ctaCode: string): string => {
    const ctaMap: Record<string, string> = {
      'learn_more': 'Learn More',
      'sign_up': 'Sign Up',
      'shop_now': 'Shop Now',
      'download': 'Download',
      'get_offer': 'Get Offer'
    };
    return ctaMap[ctaCode] || 'Learn More';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 sticky top-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Ad Preview</h2>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={viewMode === 'mobile' ? 'text-[#f6242f] bg-red-50' : 'text-[#65676B]'}
            onClick={() => setViewMode('mobile')}
          >
            <SmartphoneIcon className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={viewMode === 'desktop' ? 'text-[#f6242f] bg-red-50' : 'text-[#65676B]'}
            onClick={() => setViewMode('desktop')}
          >
            <MonitorIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Facebook/Instagram Feed Preview */}
      <div className="border border-[#E4E6EB] rounded-lg overflow-hidden mb-6">
        {/* Header */}
        <div className="p-3 border-b border-[#E4E6EB]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-[#65676B] overflow-hidden flex items-center justify-center text-white text-sm">
                {brandName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{brandName}</p>
                <p className="text-xs text-[#65676B] flex items-center gap-1">
                  Sponsored · <GlobeIcon className="h-3 w-3" />
                </p>
              </div>
            </div>
            <div>
              <MoreHorizontalIcon className="text-[#65676B] h-5 w-5" />
            </div>
          </div>
        </div>
        
        {/* Ad Content */}
        <div>
          <p className="p-3 text-sm">{primaryText}</p>
          <div className="relative">
            {mediaUrl ? (
              mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                <video
                  src={mediaUrl}
                  controls
                  className="w-full h-auto"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt="Ad content"
                  className="w-full h-auto"
                />
              )
            ) : (
              <div className="w-full h-48 bg-[#F0F2F5] flex items-center justify-center text-[#65676B]">
                <p>No media uploaded</p>
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="text-xs text-[#65676B] uppercase tracking-wide">{brandName.toLowerCase()}.com</p>
            <h3 className="font-medium">{headline}</h3>
            {description && <p className="text-sm text-[#65676B]">{description}</p>}
            <div className="flex justify-end mt-2">
              <button className="bg-[#F0F2F5] text-black text-center text-sm font-medium py-1.5 px-4 rounded">
                {getCtaText(cta)}
              </button>
            </div>
          </div>
        </div>
        
        {/* Engagement */}
        <div className="p-3 border-t border-[#E4E6EB]">
          <div className="flex justify-between text-sm text-[#65676B]">
            <div className="flex items-center gap-1">
              <ThumbsUpIcon className="h-4 w-4" />
              <span>Like</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircleIcon className="h-4 w-4" />
              <span>Comment</span>
            </div>
            <div className="flex items-center gap-1">
              <ShareIcon className="h-4 w-4" />
              <span>Share</span>
            </div>
          </div>
        </div>
      </div>
      

    </div>
  );
}
