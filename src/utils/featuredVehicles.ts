import { VehicleSearchService } from "@/controllers/booking/vechicle";

// The featured (top rated) list is a small, admin-curated set. We fetch the ids
// once and cache them so any surface can mark a vehicle as top rated.

let cache: Set<string> | null = null;
let inFlight: Promise<Set<string>> | null = null;

function extractContent(res: any): any[] {
  if (Array.isArray(res?.[0]?.data?.content)) return res[0].data.content;
  if (Array.isArray(res?.data?.content)) return res.data.content;
  if (Array.isArray(res?.content)) return res.content;
  if (Array.isArray(res)) return res;
  return [];
}

export async function getFeaturedVehicleIds(): Promise<Set<string>> {
  if (cache) return cache;
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const res: any = await VehicleSearchService.fetchFeaturedVehicles(0, 200);
      const content = extractContent(res);
      const ids = new Set<string>(
        content
          .map((v: any) => v?.id)
          .filter((x: any): x is string => typeof x === "string" && !!x),
      );
      cache = ids;
      return ids;
    } catch {
      return new Set<string>();
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}
