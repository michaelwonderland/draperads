import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { RecentAds } from "@/components/ad-creator/recent-ads";
import { Rocket, Layers, Zap, Briefcase } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <Briefcase className="h-12 w-12 text-[#f6242f]" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-black">
            Launch Ads <span className="text-[#f6242f]">10x Faster</span>
          </h1>
          <p className="text-lg text-[#65676B] mb-6 max-w-2xl mx-auto">
            Create standalone ad assets and deploy to multiple Meta Ad Sets with one click. 
            DraperAds flips the Meta Ads upload process on its head - design once, distribute everywhere.
          </p>
          <Link href="/create">
            <Button className="bg-[#f6242f] hover:opacity-90 text-white px-6 py-2 text-lg">
              Create New Ad
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-[#E4E6EB] hover:border-[#f6242f] transition-colors">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#f6242f] text-white mb-4">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Create Once, Deploy Many</h3>
          <p className="text-[#65676B]">
            Design your ad creative once and deploy it to multiple ad sets without recreating it each time in Meta Ads Manager.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-[#E4E6EB] hover:border-[#f6242f] transition-colors">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#f6242f] text-white mb-4">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-3">10x Your Ad Output</h3>
          <p className="text-[#65676B]">
            Stop wasting time in Meta Ads Manager. Create and launch campaigns in seconds, not hours, with our bulk deployment tool.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-[#E4E6EB] hover:border-[#f6242f] transition-colors">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#f6242f] text-white mb-4">
            <Rocket className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Boost ROAS</h3>
          <p className="text-[#65676B]">
            Maximize your return on ad spend by easily testing the same creative across different audiences and placements.
          </p>
        </div>
      </div>
      
      <div className="mb-12 bg-white rounded-lg shadow-sm p-6 border border-[#E4E6EB]">
        <h2 className="text-2xl font-bold mb-4 text-center">Meta Ad Management is Broken</h2>
        <p className="text-center text-[#65676B] mb-6 max-w-3xl mx-auto">
          With Meta's current process, the same creative in different ad sets is treated as different ads. 
          DraperAds lets you create standalone assets first, then distribute them to multiple ad sets efficiently.
        </p>
        <div className="flex justify-center">
          <Link href="/create">
            <Button className="bg-[#f6242f] hover:opacity-90 text-white">
              Try DraperAds Now
            </Button>
          </Link>
        </div>
      </div>
      
      <RecentAds />
    </div>
  );
}
