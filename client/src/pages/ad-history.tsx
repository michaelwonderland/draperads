import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface Ad {
  id: number;
  headline: string;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  statistics?: {
    impressions?: number;
    clicks?: number;
    cpc?: number;
  };
}

export default function AdHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: ads, isLoading } = useQuery<Ad[]>({
    queryKey: ["/api/ads"],
  });
  
  const filteredAds = ads?.filter(ad => 
    ad.headline.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-[#42B72A] text-white border-none">Active</Badge>;
      case 'draft':
        return <Badge className="bg-[#1877F2] text-white border-none">Draft</Badge>;
      case 'published':
        return <Badge className="bg-[#00B5E2] text-white border-none">Published</Badge>;
      case 'completed':
        return <Badge className="bg-[#65676B] text-white border-none">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), 'MMM d, yyyy, h:mm a');
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Ad History</h1>
          <p className="text-[#65676B]">View and manage all your created ads</p>
        </div>
        
        <div className="flex gap-3">
          <Input
            placeholder="Search ads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64"
          />
          <Link href="/create">
            <Button className="bg-[#1877F2] hover:bg-blue-600 whitespace-nowrap">
              Create New Ad
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Impressions</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>CPC</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading state
                Array(5).fill(0).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : filteredAds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-[#65676B]">
                    {searchQuery ? "No ads found matching your search" : "No ads created yet"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAds.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell className="font-medium">{ad.headline}</TableCell>
                    <TableCell>{getStatusBadge(ad.status)}</TableCell>
                    <TableCell>{formatDate(ad.createdAt)}</TableCell>
                    <TableCell>{formatDate(ad.publishedAt)}</TableCell>
                    <TableCell>{ad.statistics?.impressions?.toLocaleString() || "-"}</TableCell>
                    <TableCell>{ad.statistics?.clicks?.toLocaleString() || "-"}</TableCell>
                    <TableCell>${ad.statistics?.cpc?.toFixed(2) || "-"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/ad/${ad.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                        {ad.status === 'draft' && (
                          <Link href={`/create?id=${ad.id}`}>
                            <Button variant="outline" size="sm">Edit</Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
