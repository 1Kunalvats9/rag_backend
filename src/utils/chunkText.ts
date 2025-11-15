export const chunkText = (text: string, maxLength: number = 500): string[] => {
    const words = text.split(" ");
    const chunks: string[] = [];
    let current: string[] = [];
  
    for (const word of words) {
      if ((current.join(" ") + " " + word).length > maxLength) {
        chunks.push(current.join(" "));
        current = [];
      }
      current.push(word);
    }
  
    if (current.length > 0) chunks.push(current.join(" "));
  
    return chunks;
  };
  