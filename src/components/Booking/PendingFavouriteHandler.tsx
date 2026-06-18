"use client";

import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { FavouriteService } from "@/controllers/favourites/favouriteService";
import {
  getPendingFavourite,
  clearPendingFavourite,
  FAVOURITES_CHANGED_EVENT,
} from "@/utils/pendingFavourite";

export default function PendingFavouriteHandler() {
  const { isAuthenticated } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || handled.current) return;
    const id = getPendingFavourite();
    if (!id) return;

    handled.current = true;
    clearPendingFavourite();

    (async () => {
      try {
        const already = await FavouriteService.getVehicleFavouriteStatus(id);
        if (!already) {
          await FavouriteService.makeVehicleFavourite(id);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent(FAVOURITES_CHANGED_EVENT, { detail: { id } }),
          );
        }
        toast.success(
          already
            ? "This car is already in your favourites"
            : "Added to your favourites",
        );
      } catch {
        // If it fails, the user can favourite it manually; no hard error.
      }
    })();
  }, [isAuthenticated]);

  return null;
}
