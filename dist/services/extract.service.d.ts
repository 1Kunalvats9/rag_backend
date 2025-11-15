/**
 * Extract Service - Text file extraction only
 *
 * Simplified to handle only text files for now to avoid complexity
 * with PDF parsing and image OCR that can cause timeouts.
 */
export declare const extractTextFile: (buffer: Buffer) => Promise<string>;
//# sourceMappingURL=extract.service.d.ts.map