"use client";

import { useEffect, useState } from "react";
import { getFeaturedVehicleIds } from "@/utils/featuredVehicles";

export function useFeaturedVehicleIds(): Set<string> {
  const [ids, setIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    let mounted = true;
    getFeaturedVehicleIds()
      .then((s) => {
        if (mounted) setIds(s);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);
  return ids;
}
