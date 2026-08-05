export function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

export function randomChance(probability: number): boolean {
  return Math.random() < probability;
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[randomInt(items.length)];
}

// Capped at 3: requesting all 4 of a rank in one go is disabled game-wide.
export function randomAmount(): 1 | 2 | 3 | 4 {
  return (randomInt(3) + 1) as 1 | 2 | 3 | 4;
}
