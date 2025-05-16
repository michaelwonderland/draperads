import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  ThumbsUpIcon, 
  MessageCircleIcon, 
  ShareIcon, 
  MoreHorizontalIcon, 
  GlobeIcon,
  FacebookIcon,
  InstagramIcon,
  ExternalLinkIcon
} from "lucide-react";

interface AdPreviewProps {
  brandName: string;
  mediaUrl?: string;
  primaryText: string;
  headline: string;
  description?: string;
  cta: string;
  websiteUrl: string;
  // For placement customization support
  storiesMediaUrl?: string;
  customizedPlacements?: boolean;
  // Brand identity
  facebookPage?: string;
  instagramAccount?: string;
  // For compact display in summary
  compact?: boolean;
}

export function AdPreview({
  brandName,
  mediaUrl,
  primaryText,
  headline,
  description,
  cta,
  websiteUrl,
  storiesMediaUrl,
  customizedPlacements = false,
  facebookPage,
  instagramAccount,
  compact = false
}: AdPreviewProps) {
  const [viewMode, setViewMode] = useState<'feed' | 'stories'>('feed');
  const [showFullText, setShowFullText] = useState(false);
  const [textOverflows, setTextOverflows] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  
  // Check if text overflows on mount and on text/container change
  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const isOverflowing = textRef.current.scrollHeight > textRef.current.clientHeight;
        setTextOverflows(isOverflowing);
      }
    };
    
    checkOverflow();
    
    // Recheck on window resize
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [primaryText, compact, viewMode]);

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
  
  // Extract domain from website URL
  const extractDomain = (url: string): string => {
    try {
      // Remove protocol and path, keep just the domain
      const domain = url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
      return domain.toUpperCase();
    } catch (error) {
      // Fallback to brandName if URL parsing fails
      console.error('Error extracting domain:', error);
      return `${brandName.toUpperCase()}.COM`;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${compact ? 'p-0' : 'p-6 mb-6 sticky top-20'}`}>
      {!compact && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ad Preview</h2>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={viewMode === 'feed' ? 'text-[#f6242f] bg-red-50' : 'text-[#65676B]'}
              onClick={() => setViewMode('feed')}
            >
              <FacebookIcon className="h-4 w-4 mr-1.5" />
              Feed
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={viewMode === 'stories' ? 'text-[#f6242f] bg-red-50' : 'text-[#65676B]'}
              onClick={() => setViewMode('stories')}
            >
              <InstagramIcon className="h-4 w-4 mr-1.5" />
              Stories
            </Button>
          </div>
        </div>
      )}
      
      {viewMode === 'feed' ? (
        // Facebook Feed Preview - With fixed width for compact mode
        <div className={`border border-[#E4E6EB] rounded-lg overflow-hidden ${compact ? 'mx-auto' : ''}`} style={compact ? {maxWidth: "380px"} : {}}>
          {/* Header */}
          <div className="p-3 border-b border-[#E4E6EB]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`${compact ? 'h-8 w-8' : 'h-10 w-10'} rounded-full bg-[#65676B] overflow-hidden flex items-center justify-center text-white text-sm`}>
                  {(viewMode === 'feed' && facebookPage) 
                    ? facebookPage.charAt(0).toUpperCase()
                    : brandName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {viewMode === 'feed' 
                      ? (facebookPage || brandName) 
                      : (instagramAccount || brandName)}
                  </p>
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
          
          {/* Feed Ad Content */}
          <div>
            {/* Primary Text with "See more" functionality */}
            <div className="relative">
              <p 
                ref={textRef}
                className={`p-3 text-sm ${!showFullText && 'max-h-[4.5em] overflow-hidden'}`}
              >
                {primaryText}
              </p>
              
              {textOverflows && !showFullText && (
                <div className="absolute bottom-0 right-0 pl-8 pr-3 pb-1 pt-2 text-right bg-gradient-to-l from-white via-white to-transparent">
                  <button 
                    onClick={() => setShowFullText(true)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ...See more
                  </button>
                </div>
              )}
            </div>
            
            <div>
              {mediaUrl ? (
                mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={mediaUrl}
                    controls
                    className="w-full h-auto max-h-[250px] object-cover"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Ad content"
                    className="w-full h-auto max-h-[250px] object-cover"
                  />
                )
              ) : (
                <div className="w-full h-48 bg-[#F0F2F5] flex items-center justify-center text-[#65676B]">
                  <p>No media uploaded</p>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs text-[#65676B] uppercase tracking-wide">{extractDomain(websiteUrl)}</p>
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
      ) : (
        // Instagram Stories Preview (based on Meta's May 2025 design)
        <div className={`border border-[#E4E6EB] rounded-lg overflow-hidden ${compact ? 'mx-auto' : 'max-w-[375px] mx-auto'}`} style={compact ? {maxWidth: "240px"} : {}}>
          <div className="bg-[#F0F2F5] relative" style={compact ? {height: "400px"} : {height: "667px"}}>
            {/* Determine which media to use for Stories */}
            {(() => {
              const storyImageUrl = customizedPlacements && storiesMediaUrl ? storiesMediaUrl : mediaUrl;
              
              return storyImageUrl ? (
                storyImageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={storyImageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // If it's a 4:5 or 1:1 image, it will have gap at top and bottom
                  <div className="h-full flex items-center justify-center bg-gray-300">
                    <img
                      src={storyImageUrl}
                      alt="Ad content"
                      className="w-full object-contain"
                    />
                  </div>
                )
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-[#65676B]">
                  <p>No media uploaded</p>
                </div>
              );
            })()}
            
            {/* Stories Header */}
            <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white overflow-hidden flex items-center justify-center border border-gray-300">
                  <div className="h-7 w-7 rounded-full overflow-hidden flex items-center justify-center text-white text-xs bg-[#65676B]">
                    {instagramAccount ? instagramAccount.charAt(0).toUpperCase() : brandName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-white">{instagramAccount || brandName}</p>
                  <p className="text-[10px] text-white/80">Sponsored</p>
                </div>
              </div>
              <div className="flex gap-1">
                <div className="text-white">•••</div>
                <div className="text-white">✕</div>
              </div>
            </div>
            
            {/* Stories Content - Matching exact Meta format from screenshot */}
            <div className="absolute bottom-8 left-0 right-0 px-4">
              <div className="flex items-center justify-center">
                <button className="bg-white text-black font-serif text-base py-1.5 px-4 rounded-full flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#4895ef]">
                    <path d="M7.33333 11.3333C9.54448 11.3333 11.3333 9.54448 11.3333 7.33333C11.3333 5.12219 9.54448 3.33333 7.33333 3.33333C5.12219 3.33333 3.33333 5.12219 3.33333 7.33333C3.33333 9.54448 5.12219 11.3333 7.33333 11.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12.6667 12.6667L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {getCtaText(cta)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
