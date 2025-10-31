import { useEffect, useRef, useState } from "react";

interface Detection {
  label: string;
  confidence: number;
  box: [number, number, number, number]; // [x1, y1, x2, y2]
}

interface ImageCanvasProps {
  imageUrl: string;
  detections: Detection[];
}

const THREAT_COLORS = [
  "rgb(239, 68, 68)", // red-500
  "rgb(249, 115, 22)", // orange-500
  "rgb(234, 179, 8)", // yellow-500
  "rgb(236, 72, 153)", // pink-500
];

const ImageCanvas = ({ imageUrl, detections }: ImageCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        const displayHeight = containerWidth * aspectRatio;
        
        setDimensions({
          width: containerWidth,
          height: displayHeight,
        });
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const scaleCoordinates = (box: [number, number, number, number]) => {
    const [x1, y1, x2, y2] = box;
    const scaleX = dimensions.width / imageNaturalSize.width;
    const scaleY = dimensions.height / imageNaturalSize.height;

    return {
      left: x1 * scaleX,
      top: y1 * scaleY,
      width: (x2 - x1) * scaleX,
      height: (y2 - y1) * scaleY,
    };
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <img
        src={imageUrl}
        alt="X-ray scan"
        className="w-full h-auto rounded-lg"
        style={{ display: "block" }}
      />
      
      {detections.map((detection, index) => {
        const coords = scaleCoordinates(detection.box);
        const color = THREAT_COLORS[index % THREAT_COLORS.length];

        return (
          <div
            key={`${detection.label}-${index}`}
            className="absolute border-2 animate-pulse"
            style={{
              left: `${coords.left}px`,
              top: `${coords.top}px`,
              width: `${coords.width}px`,
              height: `${coords.height}px`,
              borderColor: color,
              boxShadow: `0 0 20px ${color}`,
            }}
          >
            <div
              className="absolute -top-7 left-0 px-2 py-1 rounded text-xs font-bold whitespace-nowrap"
              style={{
                backgroundColor: color,
                color: "white",
              }}
            >
              {detection.label} ({Math.round(detection.confidence * 100)}%)
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ImageCanvas;
