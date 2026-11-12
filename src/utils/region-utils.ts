/**
 * Region normalization and matching utilities for Ethiopian Athletics Federation.
 */

export function normalizeRegionName(name?: string | null): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/regional\s+state/gi, "")
    .replace(/city\s+administration/gi, "")
    .replace(/peoples?'?\s+region/gi, "")
    .replace(/region/gi, "")
    .replace(/state/gi, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export function isRegionMatch(
  regionA?: string | null,
  regionB?: string | null,
  idA?: string | null,
  idB?: string | null
): boolean {
  if (idA && idB && idA === idB) return true;
  if (!regionA || !regionB) return false;
  const nA = normalizeRegionName(regionA);
  const nB = normalizeRegionName(regionB);
  if (!nA || !nB) return false;
  if (nA === nB) return true;
  if (nA.includes(nB) || nB.includes(nA)) return true;
  return false;
}

