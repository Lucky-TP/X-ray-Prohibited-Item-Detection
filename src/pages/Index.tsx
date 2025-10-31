import { useState } from "react";
import { Shield, Scan } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import ImageCanvas from "@/components/ImageCanvas";
import DetectionResults from "@/components/DetectionResults";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Detection {
  label: string;
  confidence: number;
  box: [number, number, number, number];
}

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = (file: File, dataUrl: string) => {
    setSelectedFile(file);
    setImageUrl(dataUrl);
    setDetections([]);
    setHasScanned(false);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setImageUrl(null);
    setDetections([]);
    setHasScanned(false);
  };

  const handleDetect = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setHasScanned(false);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      // Replace with your actual API endpoint
      const response = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const results: Detection[] = await response.json();
      setDetections(results);
      setHasScanned(true);

      if (results.length === 0) {
        toast({
          title: "Scan Complete",
          description: "No contraband items detected",
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
  };

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
              <h1 className="text-2xl font-bold">Airport Security Scanner</h1>
              <p className="text-sm text-muted-foreground">
                AI-Powered Contraband Detection System
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Upload and Controls */}
          <div className="lg:col-span-2 space-y-6">
            <ImageUpload
              onImageSelect={handleImageSelect}
              selectedImage={imageUrl}
              onClear={handleClear}
            />

            {imageUrl && (
              <div className="space-y-4">
                <div className="bg-card rounded-lg border border-border p-6">
                  <ImageCanvas imageUrl={imageUrl} detections={detections} />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleDetect}
                    disabled={isScanning}
                    size="lg"
                    className="flex-1"
                  >
                    <Scan className="h-5 w-5 mr-2" />
                    {isScanning ? "Scanning..." : "Detect Items"}
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    size="lg"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {(hasScanned || isScanning) && (
              <DetectionResults detections={detections} isScanning={isScanning} />
            )}

            {!imageUrl && (
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Instructions
                </h3>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold">
                      1
                    </span>
                    <span>Upload an X-ray image of luggage using the upload area</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold">
                      2
                    </span>
                    <span>Click "Detect Items" to scan for contraband</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold">
                      3
                    </span>
                    <span>Review detected items with confidence scores</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold">
                      4
                    </span>
                    <span>Use "Clear" to scan a new image</span>
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
