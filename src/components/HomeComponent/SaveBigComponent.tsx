import { useEffect, useRef, useState } from "react";
import SaveBigCard, { SaveBigVehicle } from "./SaveBigCard";

interface SaveBigRentalsProps {
  cardsPerSlide?: number;
}

const SaveBigRentals: React.FC<SaveBigRentalsProps> = ({
  cardsPerSlide = 2,
}) => {
  const [vehicles, setVehicles] = useState<SaveBigVehicle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [visibleCards, setVisibleCards] = useState(cardsPerSlide);

  const ITEMS_PER_PAGE = 20;
  const MAX_DOTS = 5;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Update cards on resize
  useEffect(() => {
    const updateCards = () => {
      if (window.innerWidth < 768) setVisibleCards(1);
      else setVisibleCards(2);
    };
    updateCards();
    window.addEventListener("resize", updateCards);
    return () => window.removeEventListener("resize", updateCards);
  }, []);

  // Load initial data
  useEffect(() => {
    loadVehicles(0);
  }, []);

  const loadVehicles = async (page: number) => {
    if (loading) return;
    setLoading(true);
    try {
      // Replace this with your actual API call
      // const response = await VehicleSearchService.fetchFeaturedVehicles(page, ITEMS_PER_PAGE);

      // Mock data for demonstration
      const mockVehicles: SaveBigVehicle[] = [
        {
          id: "1",
          name: "Toyota Corolla 2015",
          vehicleTypeName: "Sedan",
          city: "Lagos",
          rating: 4.8,
          numberOfSeats: 5,
          photos: [
            { isPrimary: true, cloudinaryUrl: "/images/vehicles/2.png" },
          ],
          allPricingOptions: [
            { bookingTypeName: "Monthly", price: 420000 },
            { bookingTypeName: "Daily", price: 23000 },
          ],
        },
        {
          id: "2",
          name: "Lexus RX 350 2012",
          vehicleTypeName: "SUV",
          city: "Abuja",
          rating: 4.9,
          numberOfSeats: 7,
          photos: [
            { isPrimary: true, cloudinaryUrl: "/images/vehicles/3.png" },
          ],
          allPricingOptions: [
            { bookingTypeName: "Monthly", price: 520000 },
            { bookingTypeName: "Daily", price: 19400 },
          ],
        },
        {
          id: "5",
          name: "Lexus RX 350 2012",
          vehicleTypeName: "SUV",
          city: "Abuja",
          rating: 4.9,
          numberOfSeats: 7,
          photos: [
            { isPrimary: true, cloudinaryUrl: "/images/vehicles/1.png" },
          ],
          allPricingOptions: [
            { bookingTypeName: "Monthly", price: 520000 },
            { bookingTypeName: "Daily", price: 19400 },
          ],
        },

        {
          id: "4",
          name: "Lexus RX 350 2012",
          vehicleTypeName: "SUV",
          city: "Abuja",
          rating: 4.9,
          numberOfSeats: 7,
          photos: [
            { isPrimary: true, cloudinaryUrl: "/images/vehicles/3.png" },
          ],
          allPricingOptions: [
            { bookingTypeName: "Monthly", price: 520000 },
            { bookingTypeName: "Daily", price: 19400 },
          ],
        },
      ];

      setVehicles(mockVehicles);
      setHasMore(false);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const step = visibleCards;
    const maxIndex = Math.max(vehicles.length - visibleCards, 0);
    const newIndex = Math.min(currentIndex + step, maxIndex);
    setCurrentIndex(newIndex);

    if (newIndex + visibleCards >= vehicles.length && hasMore && !loading) {
      loadVehicles(currentPage + 1);
    }
  };

  const handlePrev = () => {
    const step = visibleCards;
    setCurrentIndex(Math.max(currentIndex - step, 0));
  };

  const handleDotClick = (dotIndex: number) => {
    const targetIndex = Math.min(
      dotIndex * visibleCards,
      vehicles.length - visibleCards
    );
    setCurrentIndex(targetIndex);
  };

  const getActiveDot = () => {
    const slidesCount = Math.ceil(vehicles.length / visibleCards);
    const active = Math.floor(currentIndex / visibleCards);
    return Math.min(active, slidesCount - 1, MAX_DOTS - 1);
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const firstChild = container.firstElementChild as HTMLElement | null;
      if (!firstChild) return;

      const cardWidth = firstChild.offsetWidth;
      const gap = parseInt(getComputedStyle(container).gap || "16", 10);
      const scrollPosition = currentIndex * (cardWidth + gap);

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const delta = touchStartX.current - touchEndX.current;
      const threshold = 50;
      if (delta > threshold) handleNext();
      else if (delta < -threshold) handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const toggleFavorite = (vehicleId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(vehicleId)) newFavorites.delete(vehicleId);
      else newFavorites.add(vehicleId);
      return newFavorites;
    });
  };

  const handleCardClick = (vehicleId: string) => {
    // Handle navigation to vehicle details
    // console.log("Navigate to vehicle:", vehicleId);
  };

  return (
    <div className="w-full flex flex-col h-[80vh] items-center justify-center py-6 ">
      <div className="">
        {/* Header */}
        <div className="flex items-center justify-center mb-6 max-w-[95%] ml-auto px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              <span className="text-blue-600">Save</span> Big On Your Next
              Rental
            </h2>
            <p className="text-gray-600">
              Monthly getaway or long-term rental? Get the best rates on premium
              vehicles with our exclusive deals.
            </p>
          </div>
        </div>

        {/* Carousel */}
        <div
          className="relative pl-12"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-hidden scroll-smooth select-none w-full pr-20"
          >
            {vehicles.map((vehicle) => (
              <SaveBigCard
                key={vehicle.id}
                vehicle={vehicle}
                onFavorite={() => toggleFavorite(vehicle.id)}
                isFavorited={favorites.has(vehicle.id)}
                onCardClick={handleCardClick}
              />
            ))}
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({
            length: Math.min(
              Math.ceil(vehicles.length / visibleCards),
              MAX_DOTS
            ),
          }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === getActiveDot()
                  ? "bg-blue-600 w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SaveBigRentals;
