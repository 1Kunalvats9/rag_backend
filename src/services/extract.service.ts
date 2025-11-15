/**
 * Extract Service - Text file extraction only
 * 
 * Simplified to handle only text files for now to avoid complexity
 * with PDF parsing and image OCR that can cause timeouts.
 */

export const extractTextFile = async (buffer: Buffer): Promise<string> => {
  try {
    console.log(`[Extract] Extracting text from buffer, size: ${buffer.length} bytes`);
    
    // Convert buffer to UTF-8 string
    const text = buffer.toString("utf-8");
    
    console.log(`[Extract] Text extraction completed, extracted ${text.length} characters`);
    
    return text;
  } catch (err: any) {
    console.error("Text extraction error:", err);
    throw new Error(`Failed to extract text: ${err.message || "Unknown error"}`);
  }
};
