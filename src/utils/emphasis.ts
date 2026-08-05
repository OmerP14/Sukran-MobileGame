export interface EmphasisSegment {
  text: string;
  emphasis: boolean;
}

// Splits on **bold** markers (see utils/format.ts `emphasize`) so the who/how
// many part of a message — who took what from whom — visually pops out
// instead of blending into the rest of the sentence.
export function splitEmphasis(message: string): EmphasisSegment[] {
  const parts = message.split(/\*\*(.*?)\*\*/g);
  // Emphasis must be computed from the *original* split index (odd = bold)
  // before filtering out empty segments — filtering first would shift the
  // indices and silently un-bold anything at the very start of the string,
  // which is every one of our messages (they all open with **name**).
  return parts
    .map((part, index) => ({ text: part, emphasis: index % 2 === 1 }))
    .filter((segment) => segment.text.length > 0);
}
