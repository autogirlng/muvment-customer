export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// ============================================
// BASIC TRACKING (What you already have)
// ============================================

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_MEASUREMENT_ID as string, {
      page_path: url,
    });
  }
};

// Generic event tracking
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// ============================================
// VEHICLE TRACKING (NEW - Add these)
// ============================================

// Track vehicle searches - tracks what users search for
export const trackVehicleSearch = ({
  searchTerm,
  category,
  location,
  priceRange,
}: {
  searchTerm?: string;
  category?: string;
  location?: string;
  priceRange?: string;
}) => {
  event({
    action: "vehicle_search",
    category: "Search",
    label: JSON.stringify({
      searchTerm,
      category,
      location,
      priceRange,
    }),
  });
};

// Track when user views a specific vehicle
export const trackVehicleView = ({
  vehicleId,
  vehicleName,
  vehicleCategory,
  price,
}: {
  vehicleId: string;
  vehicleName: string;
  vehicleCategory: string;
  price: number;
}) => {
  event({
    action: "view_item",
    category: "Vehicle",
    label: `${vehicleName} - ${vehicleCategory}`,
    value: price,
  });

  // Enhanced ecommerce tracking
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "view_item", {
      currency: "NGN",
      value: price,
      items: [
        {
          item_id: vehicleId,
          item_name: vehicleName,
          item_category: vehicleCategory,
          price: price,
        },
      ],
    });
  }
};

// ============================================
// CATEGORY & FILTER TRACKING (NEW)
// ============================================

// Track category clicks (SUV, Sedan, Luxury, etc.)
export const trackCategoryClick = (categoryName: string) => {
  event({
    action: "category_click",
    category: "Navigation",
    label: categoryName,
  });
};

// Track filter usage (price, location, etc.)
export const trackFilterUsage = (filterType: string, filterValue: string) => {
  event({
    action: "filter_applied",
    category: "Search",
    label: `${filterType}: ${filterValue}`,
  });
};

// ============================================
// PAYMENT FUNNEL TRACKING (NEW)
// ============================================

// Track payment button clicks at different stages
export const trackPaymentClick = ({
  vehicleId,
  vehicleName,
  amount,
  step,
}: {
  vehicleId: string;
  vehicleName: string;
  amount: number;
  step: "initiate" | "proceed" | "complete";
}) => {
  event({
    action: `payment_${step}`,
    category: "Payment",
    label: `${vehicleName} (${vehicleId})`,
    value: amount,
  });

  // Enhanced tracking for GA4
  if (typeof window !== "undefined" && window.gtag) {
    if (step === "initiate") {
      window.gtag("event", "begin_checkout", {
        currency: "NGN",
        value: amount,
        items: [
          {
            item_id: vehicleId,
            item_name: vehicleName,
            price: amount,
          },
        ],
      });
    } else if (step === "complete") {
      window.gtag("event", "purchase", {
        currency: "NGN",
        value: amount,
        transaction_id: `${vehicleId}_${Date.now()}`,
        items: [
          {
            item_id: vehicleId,
            item_name: vehicleName,
            price: amount,
          },
        ],
      });
    }
  }
};

// ============================================
// BOOKING TRACKING (NEW)
// ============================================

// Track successful booking
export const trackBooking = ({
  vehicleId,
  vehicleName,
  category,
  price,
  duration,
  bookingId,
}: {
  vehicleId: string;
  vehicleName: string;
  category: string;
  price: number;
  duration: string;
  bookingId: string;
}) => {
  event({
    action: "booking_completed",
    category: "Conversion",
    label: `${vehicleName} - ${duration}`,
    value: price,
  });

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: bookingId,
      value: price,
      currency: "NGN",
      items: [
        {
          item_id: vehicleId,
          item_name: vehicleName,
          item_category: category,
          price: price,
          quantity: 1,
        },
      ],
    });
  }
};

// ============================================
// ENGAGEMENT TRACKING (NEW)
// ============================================

// Track CTA button clicks
export const trackCTAClick = (ctaName: string, location: string) => {
  event({
    action: "cta_click",
    category: "Engagement",
    label: `${ctaName} - ${location}`,
  });
};

// Track add to wishlist/favorites
export const trackAddToWishlist = (vehicleId: string, vehicleName: string) => {
  event({
    action: "add_to_wishlist",
    category: "Engagement",
    label: vehicleName,
  });

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "add_to_wishlist", {
      currency: "NGN",
      items: [
        {
          item_id: vehicleId,
          item_name: vehicleName,
        },
      ],
    });
  }
};

// Track scroll depth (call this at different scroll percentages)
export const trackScrollDepth = (percentage: number) => {
  event({
    action: "scroll_depth",
    category: "Engagement",
    label: `${percentage}%`,
    value: percentage,
  });
};

// ============================================
// FORM TRACKING (NEW)
// ============================================

// Track form interactions
export const trackFormInteraction = (
  formName: string,
  action: "start" | "complete" | "abandon",
  step?: string
) => {
  event({
    action: `form_${action}`,
    category: "Form",
    label: step ? `${formName} - ${step}` : formName,
  });
};

// ============================================
// USER TRACKING (NEW)
// ============================================

// Track authentication actions
export const trackAuth = (action: "login" | "signup" | "logout") => {
  event({
    action: action,
    category: "User",
    label: action,
  });
};

// ============================================
// ERROR TRACKING (NEW)
// ============================================

// Track errors
export const trackError = (errorType: string, errorMessage: string) => {
  event({
    action: "error",
    category: "Error",
    label: `${errorType}: ${errorMessage}`,
  });
};

// ============================================
// TypeScript Declaration
// ============================================

declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}
