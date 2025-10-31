import { AlertTriangle, CheckCircle, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Detection {
  label: string;
  confidence: number;
  box: [number, number, number, number];
}

interface DetectionResultsProps {
  detections: Detection[];
  isScanning: boolean;
}

const DetectionResults = ({ detections, isScanning }: DetectionResultsProps) => {
  if (isScanning) {
    return (
      <Card className="bg-gradient-surface border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary animate-pulse" />
            Scanning...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Analyzing image for contraband items...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (detections.length === 0) {
    return (
      <Card className="bg-gradient-surface border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            No Items Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The scan completed successfully with no contraband items found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-surface border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
          Threats Detected
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {detections.map((detection, index) => (
            <div
              key={`${detection.label}-${index}`}
              className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
            >
              <div className="flex-1">
                <p className="font-semibold text-foreground">{detection.label}</p>
                <p className="text-xs text-muted-foreground">
                  Coordinates: [{detection.box.map(n => Math.round(n)).join(", ")}]
                </p>
              </div>
              <Badge
                variant={detection.confidence > 0.9 ? "destructive" : "secondary"}
                className="ml-2"
              >
                {Math.round(detection.confidence * 100)}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DetectionResults;
