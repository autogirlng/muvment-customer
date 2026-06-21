const TYPE_ACRONYMS = new Set(["SUV"]);

function titlePart(part: string): string {
  const up = part.toUpperCase();
  if (TYPE_ACRONYMS.has(up)) return up;
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

// Turn raw API type names into readable labels:
// MINI_VAN -> Mini Van, SEDAN_ELECTRIC -> Electric Sedan, SUV -> SUV,
// MID-SIZE SUV -> Mid-Size SUV.
export function formatVehicleTypeName(raw?: string | null): string {
  if (!raw) return "";

  const words = String(raw)
    .trim()
    .replace(/_+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  // Surface the electric qualifier in front, so SEDAN_ELECTRIC reads as
  // Electric Sedan rather than Sedan Electric.
  const electricIdx = words.findIndex((w) => w.toUpperCase() === "ELECTRIC");
  if (electricIdx > 0) {
    words.splice(electricIdx, 1);
    words.unshift("ELECTRIC");
  }

  return words.map((w) => w.split("-").map(titlePart).join("-")).join(" ");
}
