import { resolveApiUrl } from "@/config/env";

export interface Detection {
  label: string;
  confidence: number;
  box: [number, number, number, number];
}

export const detectContraband = async (image: File): Promise<Detection[]> => {
  const formData = new FormData();
  formData.append("image", image);

  const response = await fetch(resolveApiUrl("/api/v1/detect"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return (await response.json()) as Detection[];
};
