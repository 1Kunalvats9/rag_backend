export const chunkText = (text, maxLength = 500) => {
    const words = text.split(" ");
    const chunks = [];
    let current = [];
    for (const word of words) {
        if ((current.join(" ") + " " + word).length > maxLength) {
            chunks.push(current.join(" "));
            current = [];
        }
        current.push(word);
    }
    if (current.length > 0)
        chunks.push(current.join(" "));
    return chunks;
};
//# sourceMappingURL=chunkText.js.map