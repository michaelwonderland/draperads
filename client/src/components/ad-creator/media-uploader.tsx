import { FileUpload } from "@/components/ui/file-upload";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface MediaUploaderProps {
  onMediaUpload: (mediaUrl: string) => void;
  onSuggestionsGenerated?: (suggestions: {
    suggestedHeadline: string;
    suggestedPrimaryText: string;
    suggestedDescription: string;
    suggestedCta: string;
  }) => void;
  value?: string;
}

export function MediaUploader({ 
  onMediaUpload, 
  onSuggestionsGenerated,
  value 
}: MediaUploaderProps) {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [suggestionsAvailable, setSuggestionsAvailable] = useState(false);
  const handleFileSelect = (file: File) => {
    setMediaFile(file);
    setSuggestionsAvailable(false);
  };

  const handleUploadSuccess = (data: any) => {
    onMediaUpload(data.url);
    setError(null);
    
    // Check if AI suggestions are available
    if (data.suggestedHeadline || data.suggestedPrimaryText || data.suggestedDescription) {
      if (onSuggestionsGenerated) {
        setGeneratingSuggestions(true);
        // Simulate a short delay to indicate AI processing
        setTimeout(() => {
          onSuggestionsGenerated({
            suggestedHeadline: data.suggestedHeadline || '',
            suggestedPrimaryText: data.suggestedPrimaryText || '',
            suggestedDescription: data.suggestedDescription || '',
            suggestedCta: data.suggestedCta || 'learn_more'
          });
          setGeneratingSuggestions(false);
          setSuggestionsAvailable(true);
        }, 1000);
      }
    }
  };

  const handleRemove = () => {
    setMediaFile(null);
    onMediaUpload('');
    setSuggestionsAvailable(false);
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-medium">Media</h3>
        {generatingSuggestions && (
          <div className="flex items-center">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> 
              Generating ad suggestions...
            </Badge>
          </div>
        )}
      </div>
      
      <FileUpload
        onFileSelect={handleFileSelect}
        onFileUpload={handleUploadSuccess}
        accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime"
        uploadedFileUrl={value}
        onRemove={handleRemove}
        maxSizeMB={10}
      />
      
      {error && (
        <p className="text-destructive text-sm mt-2">{error}</p>
      )}
      

    </div>
  );
}
