import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Template {
  id: number;
  name: string;
  imageUrl: string;
}

interface TemplateSelectorProps {
  onTemplateSelect: (templateId: number) => void;
  selectedTemplateId?: number;
}

export function TemplateSelector({ onTemplateSelect, selectedTemplateId }: TemplateSelectorProps) {
  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  return (
    <div className="mb-8">
      <h3 className="text-base font-medium mb-2">Ad Template</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {isLoading ? (
          // Skeleton loading state
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="border border-[#E4E6EB] rounded-md p-2">
              <Skeleton className="w-full h-20 rounded mb-1" />
              <Skeleton className="w-1/2 h-4 mx-auto" />
            </div>
          ))
        ) : (
          templates?.map((template) => (
            <div 
              key={template.id}
              className={cn(
                "border rounded-md p-2 cursor-pointer transition-colors",
                selectedTemplateId === template.id 
                  ? "border-[#1877F2] bg-blue-50" 
                  : "border-[#E4E6EB] hover:border-[#1877F2] hover:bg-blue-50"
              )}
              onClick={() => onTemplateSelect(template.id)}
            >
              <img 
                src={template.imageUrl}
                alt={template.name} 
                className="w-full h-20 object-cover rounded mb-1" 
              />
              <p className="text-xs text-center">{template.name}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
