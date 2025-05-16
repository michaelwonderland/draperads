import { FileUpload } from "@/components/ui/file-upload";
import { useState } from "react";

interface MediaUploaderProps {
  onMediaUpload: (mediaUrl: string) => void;
  value?: string;
}

export function MediaUploader({ onMediaUpload, value }: MediaUploaderProps) {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setMediaFile(file);
  };

  const handleUploadSuccess = (data: { url: string }) => {
    onMediaUpload(data.url);
    setError(null);
  };

  const handleRemove = () => {
    setMediaFile(null);
    onMediaUpload('');
  };

  return (
    <div className="mb-4">
      <h3 className="text-base font-medium mb-2">Media</h3>
      
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
