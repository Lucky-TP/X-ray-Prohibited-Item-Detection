import { resolveApiUrl } from "@/config/env";

export interface Detection {
  label: string;
  confidence: number;
  box: [number, number, number, number];
}

interface ApiDetection {
  label: string;
  confidence: string | number;
  box: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  const parsed = parseFloat(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const detectContraband = async (
  image: File,
  confidence?: number
): Promise<Detection[]> => {
  const formData = new FormData();
  formData.append("file", image);

  if (typeof confidence === "number") {
    formData.append("confidence", confidence.toString());
  }

  const response = await fetch(resolveApiUrl("/v1/detect"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const payload = (await response.json()) as ApiDetection[];

  return payload.map((item) => ({
    label: item.label,
    confidence: toNumber(item.confidence),
    box: [
      toNumber(item.box.x0),
      toNumber(item.box.y0),
      toNumber(item.box.x1),
      toNumber(item.box.y1),
    ],
  }));
};
