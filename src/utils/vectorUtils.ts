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
  // PostgreSQL pgvector can have issues with very small scientific notation values
  const formattedNumbers = embedding.map(val => {
    // For very small or very large numbers, use fixed notation
    // Otherwise use the number as-is converted to string
    if (Math.abs(val) < 1e-10 || Math.abs(val) > 1e10) {
      // Use fixed notation with enough precision
      const str = val.toFixed(20);
      // Remove trailing zeros but keep the number
      return str.replace(/\.?0+$/, '') || '0';
    }
    // For normal numbers, convert to string (handles decimals properly)
    return val.toString();
  });
  
  // Join numbers with commas, no spaces - pgvector format: [0.1,0.2,0.3]
  const vectorString = `[${formattedNumbers.join(',')}]`;
  
  // Validate format (should not contain quotes)
  if (vectorString.includes("'") || vectorString.includes('"')) {
    throw new Error("Vector literal contains invalid characters");
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

