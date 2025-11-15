import { PDFParse } from "pdf-parse";
import cloudinary from "../config/cloudinary.js";

export const extractPDF = async (buffer: Buffer): Promise<string> => {
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text || "";
  } catch (err) {
    console.error("PDF extraction error:", err);
    return "";
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
