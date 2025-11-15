import pdfParse from "pdf-parse";
import cloudinary from "../config/cloudinary.js";

export const extractPDF = async (buffer: Buffer): Promise<string> => {
  try {
    // pdf-parse expects a Buffer directly
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (err: any) {
    console.error("PDF extraction error:", err);
    throw new Error(`Failed to extract PDF: ${err.message || "Unknown error"}`);
  }
};

export const extractTextFile = async (buffer: Buffer): Promise<string> => {
  return buffer.toString("utf-8");
};

export const extractImage = async (filePath: string): Promise<string> => {
  try {
    // Cloudinary OCR (built in!)
    const result: any = await cloudinary.uploader.upload(filePath, {
      ocr: "adv_ocr",
    });

    const text =
      result.info?.ocr?.adv_ocr?.data[0]?.textAnnotations
        ?.map((item: any) => item.description)
        .join(" ") || "";

    return text;
  } catch (err) {
    console.error("Image OCR error:", err);
    return "";
  }
};
