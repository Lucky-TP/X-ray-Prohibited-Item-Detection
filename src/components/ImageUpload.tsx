import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageSelect: (file: File, dataUrl: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

const ImageUpload = ({ onImageSelect, selectedImage, onClear }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG or JPEG image",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFile = useCallback(
    (file: File) => {
      if (!validateFile(file)) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onImageSelect(file, dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (selectedImage) {
    return (
      <div className="relative">
        <Button
          onClick={onClear}
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 z-10"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative border-2 border-dashed rounded-lg p-12 text-center transition-all
        ${isDragging ? "border-primary bg-primary/10 scale-[1.02]" : "border-border hover:border-primary/50"}
      `}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleFileInput}
      />
      
      <div className="flex flex-col items-center gap-4">
        <div className={`p-6 rounded-full bg-card transition-all ${isDragging ? "shadow-glow-primary" : ""}`}>
          <Upload className="h-12 w-12 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Upload X-Ray Image</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Drag and drop your luggage X-ray image here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports PNG, JPG, JPEG (max 5MB)
          </p>
        </div>

        <label htmlFor="file-upload">
          <Button variant="default" asChild className="cursor-pointer">
            <span>Browse Files</span>
          </Button>
        </label>
      </div>
    </div>
  );
};

export default ImageUpload;
