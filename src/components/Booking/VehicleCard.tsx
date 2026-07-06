"use client";
import {
  formatCurrency,
  getDisplayLabel,
  getDisplayPrice,
} from "@/services/vechilePriceUtiles";
import { VehicleCardProps } from "@/types/vehicle";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState, useMemo, useEffect } from "react";
import { FiMapPin, FiUser, FiDroplet, FiHeart, FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";
import { FaHeart } from "react-icons/fa6";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import { getBookingOption } from "@/context/Constarain";
import { clarityEvent } from "@/services/clarity";
import { trackVehicleView } from "@/services/analytics";
import { useAuth } from "@/context/AuthContext";
import { FavouriteService } from "@/controllers/favourites/favouriteService";
import { Spinner } from "../general/spinner";
import LoginPromptModal from "@/components/Booking/Loginpromptmodal";
import TopRatedBadge from "@/components/Booking/TopRatedBadge";
import VehicleAvailabilityModal from "@/components/Booking/VehicleAvailabilityModal";
import {
  setPendingFavourite,
  FAVOURITES_CHANGED_EVENT,
} from "@/utils/pendingFavourite";

interface VehicleCardPropsExtended extends VehicleCardProps {
  viewMode?: "list" | "grid";
}

const ImagePlaceholder = ({ size }: { size: string }) => (
  <div className="flex h-full w-full items-center justify-center">
    <svg
      className={`${size} text-gray-400`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  </div>
);

const SpecChips = ({
  willProvideDriver,
  willProvideFuel,
  numberOfSeats,
}: {
  willProvideDriver?: boolean;
  willProvideFuel?: boolean;
  numberOfSeats?: number;
}) => (
  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700">
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1">
      <FiUser className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
      {willProvideDriver ? "Driver" : "No driver"}
    </span>
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1">
      <FiDroplet className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
      {willProvideFuel ? "Fuel" : "No fuel"}
    </span>
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1">
      <MdAirlineSeatReclineNormal className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
      {numberOfSeats || 0} seats
    </span>
  </div>
);

const VehicleCard: React.FC<VehicleCardPropsExtended> = ({
  id,
  slug,
  vehicleIdentifier,
  name,
  city,
  vehicleTypeName,
  allPricingOptions,
  extraHourlyRate,
  willProvideDriver,
  willProvideFuel,
  numberOfSeats,
  photos,
  bookingType,
  viewMode = "list",
  featured,
  bookingParams,
}) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const isFeatured = featured === true;

  const images = useMemo(() => {
    if (!photos || photos.length === 0) return [];
    return [...photos]
      .sort((a, b) => (b?.isPrimary ? 1 : 0) - (a?.isPrimary ? 1 : 0))
      .map((p) => p?.cloudinaryUrl)
      .filter(
        (url) =>
          url && (url.startsWith("http://") || url.startsWith("https://")),
      );
  }, [photos]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingOptions, setBookingOptions] = useState<any[]>([]);
  const [favouriteStatus, setFavouriteStatus] = useState<boolean>(false);
  const [loadingFavouriteStatus, setLoadingFavouriteStatus] =
    useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showAvailability, setShowAvailability] = useState<boolean>(false);

  const openAvailability = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAvailability(true);
  };

  const getBookingOptions = async () => {
    const data = await getBookingOption();
    setBookingOptions(data.dropdownOptions);
  };
  useEffect(() => {
    getBookingOptions();
  }, []);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      setPendingFavourite(id);
      setShowLoginModal(true);
      return;
    }

    clarityEvent("vehicle_favorited", {
      vehicleId: id,
      name,
      city,
      vehicleType: vehicleTypeName,
    });

    setLoadingFavouriteStatus(true);
    try {
      if (favouriteStatus) {
        const data = await FavouriteService.deleteVehicleFromFavourite(id);
        if (data.message === "Success") {
          setFavouriteStatus(false);
        }
      } else {
        const data = await FavouriteService.makeVehicleFavourite(id);
        if (data?.message === "Success") {
          setFavouriteStatus(true);
        }
      }
    } catch (e) {
    } finally {
      setLoadingFavouriteStatus(false);
    }
  };

  const getVehicleFavouriteStatus = async () => {
    const favorite = await FavouriteService.getVehicleFavouriteStatus(id);
    setFavouriteStatus(favorite);
  };
  useEffect(() => {
    if (isAuthenticated) {
      getVehicleFavouriteStatus();
    }
  }, []);

  useEffect(() => {
    const onChanged = (e: Event) => {
      const changedId = (e as CustomEvent).detail?.id as string | undefined;
      if (changedId && changedId === id) setFavouriteStatus(true);
    };
    window.addEventListener(FAVOURITES_CHANGED_EVENT, onChanged);
    return () =>
      window.removeEventListener(FAVOURITES_CHANGED_EVENT, onChanged);
  }, [id]);

  const handleCardClick = () => {
    clarityEvent("vehicle_view", {
      vehicleId: id,
      name,
      city,
      vehicleType: vehicleTypeName,
      bookingType,
    });
    trackVehicleView({
      vehicleId: id,
      vehicleName: vehicleTypeName,
      vehicleCategory: bookingType || "",
      price: getDisplayPrice(bookingType, allPricingOptions, bookingOptions),
    });
    const current = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    const ctx = new URLSearchParams(current.toString());
    ctx.set("vehicleType", vehicleTypeName);
    if (bookingType) ctx.set("bookingType", bookingType);
    if (bookingParams) {
      Object.entries(bookingParams).forEach(([k, v]) => {
        if (v) ctx.set(k, v);
      });
    }
    router.push(`/booking/details/${slug || id}?${ctx.toString()}`);
  };

  const detailHref = `/booking/details/${slug || id}`;
  // Real anchor for crawlers and open-in-new-tab. Plain left clicks still run the
  // enriched in-app navigation so booking context (type, partner, search) is kept.
  const handleTitleClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      // Let the browser open the clean href in a new tab; don't also fire the
      // card's own click handler on the current tab.
      e.stopPropagation();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    handleCardClick();
  };

  const currentImage = images[currentImageIndex];

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1,
    );
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1,
    );
  };

  const ImageArrows = () =>
    images.length > 1 ? (
      <>
        <button
          onClick={prevImage}
          aria-label="Previous image"
          className="absolute bottom-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white"
        >
          <FiChevronLeft className="h-4 w-4 text-gray-700" />
        </button>
        <button
          onClick={nextImage}
          aria-label="Next image"
          className="absolute bottom-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white"
        >
          <FiChevronRight className="h-4 w-4 text-gray-700" />
        </button>
      </>
    ) : null;

  const LikeButton = ({ overlay }: { overlay?: boolean }) => (
    <button
      onClick={handleLike}
      aria-label="Add to favorites"
      className={
        overlay
          ? "absolute right-2 top-2 z-10 flex items-center justify-center rounded-full bg-white/95 p-1.5 backdrop-blur-sm transition-colors hover:bg-white"
          : "flex flex-shrink-0 items-center justify-center rounded-full p-2 transition-colors hover:bg-gray-100"
      }
    >
      {loadingFavouriteStatus ? (
        <Spinner />
      ) : favouriteStatus ? (
        <FaHeart className="h-5 w-5 cursor-pointer text-red-500" />
      ) : (
        <FiHeart className="h-5 w-5 cursor-pointer text-gray-600" />
      )}
    </button>
  );

  const CityBadge = () => (
    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 backdrop-blur-sm">
      <FiMapPin className="h-3.5 w-3.5 text-gray-700" />
      <span className="text-xs font-semibold uppercase text-gray-700">
        {city || "N/A"}
      </span>
    </div>
  );

  const PriceBlock = () => {
    if (bookingType) {
      return (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-500">
              {(
                allPricingOptions?.find((o) => o.bookingTypeId === bookingType)
                  ?.bookingTypeName || getDisplayLabel(bookingType, bookingOptions)
              ).trim()}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(
                getDisplayPrice(bookingType, allPricingOptions, bookingOptions),
              )}
            </p>
          </div>
          {extraHourlyRate > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Extra hours</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(extraHourlyRate)}
              </p>
            </div>
          )}
        </div>
      );
    }

    const opts = allPricingOptions || [];
    if (!opts.length) {
      return <p className="text-sm text-gray-500">Price on request</p>;
    }
    const primary =
      opts.find((o) => o.bookingTypeName?.toLowerCase().includes("12")) ||
      opts[0];
    const secondary = opts.filter(
      (o) => o.bookingTypeId !== primary.bookingTypeId,
    );

    return (
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="text-xs text-gray-500">{primary.bookingTypeName}</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(primary.price)}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
          {secondary.map((o) => (
            <div key={o.bookingTypeId}>
              <p className="text-[11px] text-gray-400">{o.bookingTypeName}</p>
              <p className="text-sm font-semibold text-gray-700">
                {formatCurrency(o.price)}
              </p>
            </div>
          ))}
          {extraHourlyRate > 0 && (
            <div>
              <p className="text-[11px] text-gray-400">Extra hours</p>
              <p className="text-sm font-semibold text-gray-700">
                {formatCurrency(extraHourlyRate)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const availabilityLink = (
    <button
      onClick={openAvailability}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0673FF] transition hover:text-[#0560d6] hover:underline"
    >
      <FiCalendar className="h-4 w-4" />
      View availability
    </button>
  );

  const availabilityModalEl = (
    <span onClick={(e) => e.stopPropagation()}>
      <VehicleAvailabilityModal
        isOpen={showAvailability}
        onClose={() => setShowAvailability(false)}
        vehicleId={id}
        vehicleIdentifier={vehicleIdentifier}
        vehicleName={name}
        slug={slug}
        bookingType={bookingType}
        vehicleTypeName={vehicleTypeName}
      />
    </span>
  );

  // Grid View
  if (viewMode === "grid") {
    return (
      <div
        onClick={handleCardClick}
        className="group flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg"
      >
        <span onClick={(e) => e.stopPropagation()}>
          <LoginPromptModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            vehicleName={name}
          />
        </span>
        {availabilityModalEl}
        <div className="relative h-[180px] w-full bg-gray-100">
          {currentImage ? (
            <img
              src={currentImage}
              alt={name || "Vehicle"}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlaceholder size="h-12 w-12" />
          )}
          <CityBadge />
          <ImageArrows />
          <LikeButton overlay />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-gray-900">
              <Link
                href={detailHref}
                onClick={handleTitleClick}
                className="hover:underline"
              >
                {name}
              </Link>
            </h3>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <p className="text-sm text-gray-500">
                {vehicleTypeName.replaceAll("_", " ")}
              </p>
              {isFeatured && <TopRatedBadge />}
            </div>
          </div>
          <SpecChips
            willProvideDriver={willProvideDriver}
            willProvideFuel={willProvideFuel}
            numberOfSeats={numberOfSeats}
          />
          <div className="mt-auto space-y-2.5">
            <PriceBlock />
            <div className="border-t border-gray-100 pt-2.5">
              {availabilityLink}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div
      onClick={handleCardClick}
      className="group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-md sm:min-h-[180px] sm:flex-row"
    >
      <span onClick={(e) => e.stopPropagation()}>
        <LoginPromptModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          vehicleName={name}
        />
      </span>
      {availabilityModalEl}
      <div className="relative h-[180px] w-full flex-shrink-0 bg-gray-100 sm:h-auto sm:w-[200px] md:w-[240px]">
        {currentImage ? (
          <img
            src={currentImage}
            alt={name || "Vehicle"}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImagePlaceholder size="h-16 w-16" />
        )}
        <CityBadge />
        <ImageArrows />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
              <Link
                href={detailHref}
                onClick={handleTitleClick}
                className="hover:underline"
              >
                {name}
              </Link>
            </h3>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <p className="text-sm text-gray-500">
                {vehicleTypeName.replaceAll("_", " ")}
              </p>
              {isFeatured && <TopRatedBadge />}
            </div>
          </div>
          {<LikeButton />}
        </div>

        <SpecChips
          willProvideDriver={willProvideDriver}
          willProvideFuel={willProvideFuel}
          numberOfSeats={numberOfSeats}
        />

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
          <PriceBlock />
          {availabilityLink}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
