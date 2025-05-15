import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Ad {
  id: number;
  mediaUrl?: string;
  headline: string;
  createdAt: string;
  status: string;
  statistics?: {
    clicks?: number;
    cpc?: number;
  };
}

export function RecentAds() {
  const { data: ads, isLoading } = useQuery<Ad[]>({
    queryKey: ["/api/ads"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="absolute top-2 right-2 bg-[#42B72A] text-white border-none">Active</Badge>;
      case 'draft':
        return <Badge className="absolute top-2 right-2 bg-[#1877F2] text-white border-none">Draft</Badge>;
      case 'completed':
        return <Badge className="absolute top-2 right-2 bg-[#65676B] text-white border-none">Completed</Badge>;
      default:
        return <Badge className="absolute top-2 right-2 bg-[#65676B] text-white border-none">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Ads</h2>
        <Link href="/history">
          <Button variant="link" className="text-[#1877F2] hover:underline text-sm p-0">
            View All
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden border border-[#E4E6EB]">
              <Skeleton className="h-36 w-full" />
              <div className="p-3">
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            </div>
          ))
        ) : (
          ads?.slice(0, 4).map((ad) => (
            <Link key={ad.id} href={`/ad/${ad.id}`}>
              <a className="bg-white rounded-lg shadow-sm overflow-hidden border border-[#E4E6EB] hover:shadow-md transition cursor-pointer block">
                <div className="h-36 bg-[#F0F2F5] relative">
                  {ad.mediaUrl ? (
                    <img 
                      src={ad.mediaUrl} 
                      alt={ad.headline} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#65676B]">
                      No image
                    </div>
                  )}
                  {getStatusBadge(ad.status)}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm mb-1">{ad.headline}</h3>
                  <p className="text-xs text-[#65676B] mb-2">
                    Created: {formatDate(ad.createdAt)}
                  </p>
                  <div className="flex justify-between text-xs">
                    {ad.status !== 'draft' && ad.statistics ? (
                      <>
                        <span>{ad.statistics.clicks?.toLocaleString() || 0} Clicks</span>
                        <span>${ad.statistics.cpc?.toFixed(2) || '0.00'} CPC</span>
                      </>
                    ) : (
                      <span>Not published</span>
                    )}
                  </div>
                </div>
              </a>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
