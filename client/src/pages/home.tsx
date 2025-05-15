import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { RecentAds } from "@/components/ad-creator/recent-ads";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Create Beautiful Social Media Ads</h1>
          <p className="text-lg text-[#65676B] mb-6 max-w-2xl mx-auto">
            Design professional-quality social media ads in minutes without design skills, and publish them directly to Meta Ad Sets with one click.
          </p>
          <Link href="/create">
            <Button className="bg-[#1877F2] hover:bg-blue-600 text-white px-6 py-2 text-lg">
              Create New Ad
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-[#1877F2] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paint-brush"><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/><path d="M14.5 17.5 4.5 15"/></svg>
          </div>
          <h3 className="text-xl font-semibold mb-3">Easy Design</h3>
          <p className="text-[#65676B]">
            Create professional-looking ads with our pre-designed templates. No design skills required.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-[#1877F2] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-target"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <h3 className="text-xl font-semibold mb-3">Target Audience</h3>
          <p className="text-[#65676B]">
            Define your target audience and select the right ad placements to reach potential customers.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-[#1877F2] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rocket"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
          </div>
          <h3 className="text-xl font-semibold mb-3">One-Click Publish</h3>
          <p className="text-[#65676B]">
            Publish your ads directly to Meta platforms with a single click. Save time and reduce errors.
          </p>
        </div>
      </div>
      
      <RecentAds />
    </div>
  );
}
