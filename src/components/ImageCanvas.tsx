import { useEffect, useMemo, useRef, useState } from "react";

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
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  const updateDisplaySize = useMemo(() => {
    return (naturalWidth: number, naturalHeight: number) => {
      if (!containerRef.current || !naturalWidth || !naturalHeight) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scale = Math.min(
        rect.width / naturalWidth,
        rect.height / naturalHeight
      );

      setDisplaySize({
        width: naturalWidth * scale,
        height: naturalHeight * scale,
      });
    };
  }, []);

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.onload = () => {
      const natural = { width: img.naturalWidth, height: img.naturalHeight };
      setImageNaturalSize(natural);
      updateDisplaySize(natural.width, natural.height);
    };
    img.src = imageUrl;
  }, [imageUrl, updateDisplaySize]);

  useEffect(() => {
    if (!imageNaturalSize.width || !containerRef.current) return;

    const observer =
      typeof window !== "undefined" && "ResizeObserver" in window
        ? new window.ResizeObserver(() => {
            updateDisplaySize(imageNaturalSize.width, imageNaturalSize.height);
          })
        : null;

    if (observer && containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer?.disconnect();
    };
  }, [imageNaturalSize, updateDisplaySize]);

  const scaleCoordinates = (box: [number, number, number, number]) => {
    const [x1, y1, x2, y2] = box;
    const scaleX = displaySize.width / imageNaturalSize.width;
    const scaleY = displaySize.height / imageNaturalSize.height;

    return {
      left: x1 * scaleX,
      top: y1 * scaleY,
      width: (x2 - x1) * scaleX,
      height: (y2 - y1) * scaleY,
    };
  };

  return (
    <div ref={containerRef} className="relative flex h-full w-full items-center justify-center">
      {displaySize.width > 0 && (
        <div
          className="relative"
          style={{
            width: `${displaySize.width}px`,
            height: `${displaySize.height}px`,
          }}
        >
          <img
            src={imageUrl}
            alt="X-ray scan"
            className="h-full w-full rounded-md"
            style={{ display: "block", objectFit: "contain" }}
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
                  className="absolute -top-7 left-0 whitespace-nowrap rounded px-2 py-1 text-xs font-bold"
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
      )}
    </div>
  );
};

export default ImageCanvas;
