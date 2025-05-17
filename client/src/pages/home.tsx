import { Link } from "wouter";
import { Button } from "@/components/ui/button";
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
            Upload Performance Ads: <span className="text-[#f6242f]">The Way It Should Be</span>
          </h1>
          <h2 className="text-2xl font-semibold mb-4 text-black">Simple. Seamless. Solved.</h2>
          <p className="text-lg text-[#65676B] mb-6 max-w-2xl mx-auto">
            We imagined a simpler world where you create ads first, then distribute them to campaigns - 
            not rebuilding the same creative for each ad set. Since ad platforms won't fix this 
            fundamental workflow issue, we built DraperAds to do it for you.
          </p>
          <Link href="/ad-creator">
            <Button className="bg-[#f6242f] hover:bg-[#F5DEB3] hover:text-[#333] text-white px-6 py-2 text-lg">
              Create An Ad
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
            Build your perfect ad creative once, then distribute it to as many campaigns and ad sets as you need without repetitive rebuilding. The way it should have always been, really.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-[#E4E6EB] hover:border-[#f6242f] transition-colors">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#f6242f] text-white mb-4">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-3">10x Your Ad Output</h3>
          <p className="text-[#65676B]">
            Stop wasting hours rebuilding the same ads. Our bulk deployment tool lets you target multiple audiences with the same creative in just seconds.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-[#E4E6EB] hover:border-[#f6242f] transition-colors">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#f6242f] text-white mb-4">
            <Rocket className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Shift Time & Focus to Ad Ideation</h3>
          <p className="text-[#65676B]">
            Your expertise is too valuable to spend on repetitive tasks. Free up your mental energy for what truly matters - creative strategy and campaign innovation.
          </p>
        </div>
      </div>
      
      <div className="mb-12 bg-white rounded-lg shadow-sm p-6 border border-[#E4E6EB]">
        <h2 className="text-2xl font-bold mb-4 text-center">The Current Ad Creation Process is Backwards</h2>
        <p className="text-center text-[#65676B] mb-6 max-w-3xl mx-auto">
          Platforms like Meta force you to recreate the same ad for each campaign and ad set, wasting countless hours. 
          DraperAds flips the process: create once, then deploy across multiple campaigns and ad sets with a single click.
        </p>
        <div className="flex justify-center">
          <Link href="/ad-creator">
            <Button className="bg-[#f6242f] hover:bg-[#F5DEB3] hover:text-[#333] text-white">
              Try DraperAds Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
