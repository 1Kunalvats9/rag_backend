/**
 * Vector Utilities - Helper functions for pgvector operations
 * 
 * IMPORTANT: Vector literals must be interpolated directly into SQL strings
 * (not passed as parameters) because Prisma wraps parameters in quotes,
 * which breaks pgvector's vector literal format.
 */

/**
 * Escapes single quotes in a string for SQL interpolation
 */
export const escapeSqlString = (str: string): string => {
  return str.replace(/'/g, "''");
};

/**
 * Formats an embedding array as a pgvector literal string
 * Returns: [0.1,0.2,0.3] (unquoted vector literal format)
 * 
 * This will be wrapped in single quotes when interpolated into SQL:
 * '${vectorLiteral}'::vector
 */
export const formatVectorLiteral = (embedding: number[]): string => {
  if (embedding.length === 0) {
    throw new Error("Embedding array cannot be empty");
  }
  
  // Validate all values are numbers
  if (!embedding.every(val => typeof val === 'number' && !isNaN(val) && isFinite(val))) {
    throw new Error("Embedding array contains invalid numbers");
  }
  
  // Format numbers to avoid scientific notation issues
  // PostgreSQL pgvector requires fixed decimal notation, not scientific notation
  const formattedNumbers = embedding.map(val => {
    // Convert to string first to check if it's already in scientific notation
    let str = val.toString();
    
    // Check if string contains scientific notation OR if number magnitude suggests it would
    const absVal = Math.abs(val);
    const hasScientificNotation = str.includes('e') || str.includes('E');
    const isVerySmall = absVal > 0 && absVal < 1e-5; // More aggressive threshold
    const isVeryLarge = absVal > 1e10;
    
    // Always format if it has scientific notation OR if magnitude suggests it needs formatting
    if (hasScientificNotation || isVerySmall || isVeryLarge) {
      if (hasScientificNotation) {
        // Parse the exponent from the string
        const match = str.match(/[eE]([+-]?\d+)$/);
        if (match && match[1]) {
          const exponent = parseInt(match[1]);
          if (exponent < 0) {
            // For negative exponents, use enough decimal places
            const decimalPlaces = Math.min(Math.abs(exponent) + 25, 100);
            str = val.toFixed(decimalPlaces);
          } else {
            str = val.toFixed(20);
          }
        } else {
          str = val.toFixed(50);
        }
      } else if (isVerySmall) {
        // Calculate decimal places needed for very small numbers
        // Use log10 to find the exponent
        try {
          const log10 = Math.log10(absVal);
          const exponent = Math.floor(log10);
          const decimalPlaces = Math.min(Math.abs(exponent) + 25, 100);
          str = val.toFixed(decimalPlaces);
        } catch {
          // Fallback if log10 fails (shouldn't happen for finite numbers)
          str = val.toFixed(50);
        }
      } else if (isVeryLarge) {
        str = val.toFixed(10);
      }
    }
    
    // Final check: ensure no scientific notation remains
    if (str.includes('e') || str.includes('E')) {
      // Force conversion using toFixed
      str = val.toFixed(50);
    }
    
    // Remove trailing zeros after decimal point
    if (str.includes('.')) {
      str = str.replace(/\.?0+$/, '');
      if (str === '' || str === '-') {
        str = '0';
      }
    }
    
    return str;
  });
  
  // Join numbers with commas, no spaces - pgvector format: [0.1,0.2,0.3]
  const vectorString = `[${formattedNumbers.join(',')}]`;
  
  // Validate format (should not contain quotes or scientific notation)
  if (vectorString.includes("'") || vectorString.includes('"')) {
    throw new Error("Vector literal contains invalid characters");
  }
  
  // CRITICAL: Ensure no scientific notation remains
  if (vectorString.includes('e') || vectorString.includes('E')) {
    console.error("ERROR: Vector literal still contains scientific notation!");
    console.error("Sample values:", formattedNumbers.slice(0, 10));
    throw new Error("Vector literal contains scientific notation which PostgreSQL cannot parse");
  }
  
  return vectorString;
};

/**
 * Safely interpolates a vector literal into SQL UPDATE query
 * Escapes the chunk ID to prevent SQL injection
 * 
 * Result: UPDATE "Chunk" SET embedding = '[0.1,0.2,0.3]'::vector WHERE id = 'chunk-id'
 */
export const buildVectorUpdateQuery = (
  vectorLiteral: string,
  chunkId: string
): string => {
  const escapedChunkId = escapeSqlString(chunkId);
  // Vector literal is wrapped in single quotes and cast to vector type
  return `UPDATE "Chunk" SET embedding = '${vectorLiteral}'::vector WHERE id = '${escapedChunkId}'`;
};

/**
 * Safely interpolates a vector literal into a similarity search query
 * Escapes userId to prevent SQL injection
 * 
 * Result: SELECT ... ORDER BY embedding <-> CAST('[0.1,0.2,0.3]' AS vector) LIMIT 5
 */
export const buildVectorSearchQuery = (
  vectorLiteral: string,
  userId: string,
  topK: number
): string => {
  const escapedUserId = escapeSqlString(userId);
  const limit = Math.max(1, Math.min(100, Math.floor(topK))); // Sanitize limit
  
  // Use CAST to ensure proper vector type conversion
  // Escape single quotes in vector literal if any (shouldn't happen but safety first)
  const escapedVector = vectorLiteral.replace(/'/g, "''");
  
  return `
    SELECT id, "userId", "fileId", text, "createdAt"
    FROM "Chunk"
    WHERE "userId" = '${escapedUserId}'
      AND embedding IS NOT NULL
      AND array_length(embedding::text::float[], 1) > 0
    ORDER BY embedding <-> CAST('${escapedVector}' AS vector)
    LIMIT ${limit};
  `.trim();
};

