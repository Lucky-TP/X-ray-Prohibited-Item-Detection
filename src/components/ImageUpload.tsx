import { useCallback } from "react";
import { Upload, X } from "lucide-react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageSelect: (file: File, dataUrl: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = {
  "image/png": [],
  "image/jpeg": [],
};

const ImageUpload = ({ onImageSelect, selectedImage, onClear }: ImageUploadProps) => {
  const { toast } = useToast();

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onImageSelect(file, dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDropAccepted = useCallback(
    (files: File[]) => {
      const [file] = files;
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDropRejected = useCallback(
    (rejections: FileRejection[]) => {
      const rejection = rejections[0];
      const error = rejection?.errors[0];

      if (!error) return;

      let description = error.message;

      if (error.code === "file-too-large") {
        description = "Maximum file size is 5MB.";
      } else if (error.code === "file-invalid-type") {
        description = "Please upload a PNG or JPEG image.";
      }

      toast({
        title: "Upload error",
        description,
        variant: "destructive",
      });
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE_BYTES,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    onDropAccepted: handleDropAccepted,
    onDropRejected: handleDropRejected,
  });

  const triggerFileDialog = useCallback(() => {
    open();
  }, [open]);

  const dropZoneClasses = `
    relative border-2 border-dashed rounded-xl transition-all ease-in-out cursor-pointer
    flex flex-col items-center justify-center text-center overflow-hidden
    h-[340px] sm:h-[400px] lg:h-[440px] w-full
    ${isDragActive ? "border-primary bg-primary/10 scale-[1.01]" : "border-border hover:border-primary/60"}
  `;

  return (
    <div
      {...getRootProps({
        className: dropZoneClasses,
        role: "button",
        tabIndex: 0,
        onClick: (event) => {
          event.preventDefault();
          triggerFileDialog();
        },
        onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            triggerFileDialog();
          }
        },
      })}
    >
      <input {...getInputProps()} />

      {!selectedImage ? (
        <div className="flex flex-col items-center gap-5 px-6 py-10">
          <div
            className={`p-6 rounded-full bg-card transition-all ${isDragActive ? "shadow-glow-primary" : ""}`}
          >
            <Upload className="h-12 w-12 text-primary" />
          </div>

          <div className="space-y-3 max-w-lg">
            <h3 className="text-2xl font-semibold">Upload X-Ray Image</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop your luggage scan or click below to browse from your device.
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PNG, JPG, JPEG formats up to 5MB.
            </p>
          </div>

          <Button
            variant="default"
            onClick={(event) => {
              event.stopPropagation();
              triggerFileDialog();
            }}
          >
            Browse Files
          </Button>
        </div>
      ) : (
        <>
          <div className="absolute top-4 right-4 flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                triggerFileDialog();
              }}
            >
              Replace Image
            </Button>
            <Button
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
              variant="destructive"
              size="sm"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>

          <div className="w-full h-full px-4 pb-6 pt-12 sm:px-8 sm:pt-16">
            <div className="mx-auto max-w-4xl h-full rounded-lg bg-muted/40 p-4 sm:p-6 md:p-8">
              <img
                src={selectedImage}
                alt="Selected X-ray preview"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageUpload;
