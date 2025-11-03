import { useCallback, useEffect, useState } from "react";
import { Shield, Scan } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import ImageCanvas from "@/components/ImageCanvas";
import DetectionResults from "@/components/DetectionResults";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  detectContraband,
  type Detection,
} from "@/services/detectionService";
import ProhibitedItemsShowcase, {
  type ExampleSelection,
} from "@/components/ProhibitedItemsShowcase";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = useCallback((file: File, dataUrl: string) => {
    setSelectedFile(file);
    setImageUrl(dataUrl);
    setDetections([]);
    setHasScanned(false);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setImageUrl(null);
    setDetections([]);
    setHasScanned(false);
  }, []);

  const handleDetect = useCallback(async (fileToScan: File) => {
    setIsScanning(true);
    setHasScanned(false);

    try {
      const results = await detectContraband(fileToScan);
      setDetections(results);
      setHasScanned(true);

      if (results.length === 0) {
        toast({
          title: "Scan Complete",
          description: "No prohibited items detected",
        });
      } else {
        toast({
          title: "Threats Detected",
          description: `Found ${results.length} potential threat(s)`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Detection error:", error);
      toast({
        title: "Scan Failed",
        description: "Error processing image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  }, [toast]);

  const handleExampleSelect = useCallback(
    async ({ url, name, slug }: ExampleSelection) => {
      try {
        setIsScanning(true);
        setHasScanned(false);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load example image: ${response.status}`);
        }

        const blob = await response.blob();
        const inferredExtension =
          blob.type?.split("/")[1] ??
          url.split(".").pop()?.split("?")[0] ??
          "png";

        const baseName =
          slug ||
          name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") ||
          "example-image";

        const file = new File([blob], `${baseName}.${inferredExtension}`, {
          type: blob.type || `image/${inferredExtension}`,
        });

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed to read example file"));
          reader.readAsDataURL(file);
        });

        handleImageSelect(file, dataUrl);
      } catch (error) {
        console.error("Example selection error:", error);
        toast({
          title: "Unable to load example",
          description: "Please try another example image.",
          variant: "destructive",
        });
        setIsScanning(false);
      }
    },
    [handleImageSelect, toast]
  );

  useEffect(() => {
    if (selectedFile) {
      void handleDetect(selectedFile);
    }
  }, [selectedFile, handleDetect]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                X-ray Prohibited Item Detection
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-powered screening for restricted items and security threats.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <ImageUpload
              onImageSelect={handleImageSelect}
              selectedImage={imageUrl}
              onClear={handleClear}
            />
          </div>

          {/* Right Column - Output */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6 h-[340px] sm:h-[400px] lg:h-[440px] relative">
              {imageUrl && (
                <Button
                  onClick={handleClear}
                  variant="destructive"
                  size="sm"
                  className="absolute right-4 top-4 z-10"
                >
                  Clear
                </Button>
              )}

              {imageUrl ? (
                <div className="h-full w-full overflow-hidden rounded-md bg-muted/30 p-2">
                  <ImageCanvas imageUrl={imageUrl} detections={detections} />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                  <Scan className="h-8 w-8 text-primary" />
                  <p>Upload an X-ray image on the left to view annotated detections here.</p>
                </div>
              )}
            </div>

            {(hasScanned || isScanning) && (
              <DetectionResults detections={detections} isScanning={isScanning} />
            )}
          </div>
        </div>

        <div className="mt-8">
          <ProhibitedItemsShowcase onExampleSelect={handleExampleSelect} />
        </div>
      </main>
    </div>
  );
};

export default Index;
