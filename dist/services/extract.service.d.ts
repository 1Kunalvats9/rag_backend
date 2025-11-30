/**
 * Extract text from a file buffer (for text files)
 * @param buffer - File buffer
 * @returns Extracted text as string
 */
export declare const extractTextFile: (buffer: Buffer) => Promise<string>;
export interface ExtractedInfo {
    type: "personal_info" | "fact" | "preference" | "other";
    keyValuePairs: Record<string, string>;
    summary: string;
}
/**
 * Extract structured information from user query using Gemini
 * @param query - User query string
 * @returns Extracted information with key-value pairs
 */
export declare const extractInformation: (query: string) => Promise<ExtractedInfo>;
//# sourceMappingURL=extract.service.d.ts.map