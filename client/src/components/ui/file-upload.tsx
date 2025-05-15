import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { Upload, X } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileUpload?: (data: any) => void;
  accept?: string;
  className?: string;
  uploadedFileUrl?: string;
  onRemove?: () => void;
  maxSizeMB?: number;
}

export function FileUpload({
  onFileSelect,
  onFileUpload,
  accept = "image/*,video/*",
  className,
  uploadedFileUrl,
  onRemove,
  maxSizeMB = 10
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    // Reset error state
    setError(null);
    
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    
    // Check file type
    const acceptedTypes = accept.split(",").map(type => type.trim());
    const fileType = file.type;
    
    // If there's a specific accept parameter, validate against it
    if (accept !== "*" && !acceptedTypes.some(type => {
      // Handle wildcards like image/* by checking if the file type starts with the base type
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0];
        return fileType.startsWith(`${baseType}/`);
      }
      return type === fileType;
    })) {
      setError("File type not supported");
      return;
    }
    
    onFileSelect(file);
    
    if (onFileUpload) {
      uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("media", file);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (onFileUpload) {
        onFileUpload(data);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
  };

  const renderPreview = () => {
    if (!uploadedFileUrl) return null;
    
    const isVideo = uploadedFileUrl.match(/\.(mp4|webm|ogg|mov)$/i);
    
    return (
      <div className="relative mt-4">
        {isVideo ? (
          <video 
            src={uploadedFileUrl} 
            className="w-full h-auto rounded-md" 
            controls 
          />
        ) : (
          <img 
            src={uploadedFileUrl} 
            alt="Uploaded media preview" 
            className="w-full h-auto rounded-md" 
          />
        )}
        <button 
          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
          onClick={handleRemove}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    );
  };

  return (
    <div className={className}>
      {!uploadedFileUrl ? (
        <div
          className={cn(
            "border border-dashed border-border rounded-lg p-6 bg-muted flex flex-col items-center justify-center",
            isDragging && "border-primary bg-primary/5",
            className
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm mb-2">
            Drag and drop your media here, or click to browse
          </p>
          <Button 
            variant="outline" 
            type="button"
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Media"}
          </Button>
          {error && <p className="text-destructive text-xs mt-2">{error}</p>}
          <p className="text-xs text-muted-foreground mt-3">
            Recommended: 1200 x 628 pixels. JPG, PNG, or MP4.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
        </div>
      ) : (
        renderPreview()
      )}
    </div>
  );
}
