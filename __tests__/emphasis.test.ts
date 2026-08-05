import { splitEmphasis } from "../src/utils/emphasis";

describe("splitEmphasis", () => {
  it("marks a leading emphasized segment as bold, not plain", () => {
    // Every real message starts with **name** — this is exactly the case
    // that broke when empties were filtered before the odd/even check.
    const segments = splitEmphasis("**Bot 2** oynuyor…");
    expect(segments[0]).toEqual({ text: "Bot 2", emphasis: true });
    expect(segments[1]).toEqual({ text: " oynuyor…", emphasis: false });
  });

  it("alternates correctly across multiple emphasized segments", () => {
    const segments = splitEmphasis("**Bot 2**, **Bot 1'den** **3 Vale** aldı.");
    expect(segments).toEqual([
      { text: "Bot 2", emphasis: true },
      { text: ", ", emphasis: false },
      { text: "Bot 1'den", emphasis: true },
      { text: " ", emphasis: false },
      { text: "3 Vale", emphasis: true },
      { text: " aldı.", emphasis: false },
    ]);
  });

  it("returns the whole string unemphasized when there are no markers", () => {
    expect(splitEmphasis("Sırada sen varsın")).toEqual([
      { text: "Sırada sen varsın", emphasis: false },
    ]);
  });
});
