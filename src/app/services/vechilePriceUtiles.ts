export interface PricingOption {
  bookingTypeId: string;
  bookingTypeName: string;
  price: number;
  platformFeeType: string;
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const getDisplayPrice = (
  bookingType: string | null | undefined,
  allPricingOptions: PricingOption[]
): number => {
  if (bookingType && allPricingOptions && allPricingOptions.length > 0) {
    const bookingTypePrice = allPricingOptions.find(
      (bt) => bt.bookingTypeName === bookingType
    );
    return bookingTypePrice
      ? bookingTypePrice.price
      : allPricingOptions[0]?.price || 0;
  }
  return allPricingOptions?.[0]?.price || 0;
};

export const getDisplayLabel = (
  bookingType: string | null | undefined
): string => {
  if (bookingType) {
    const labels: { [key: string]: string } = {
      AN_HOUR: "1 Hour",
      THREE_HOURS: "3 Hours",
      SIX_HOURS: "6 Hours",
      TWELVE_HOURS: "12 Hours",
      TWENTY_FOUR_HOURS: "24 Hours",
    };
    return labels[bookingType] || "Daily";
  }
  return "Daily";
};

export const getPriceDisplay = (
  bookingType: string | null | undefined,
  allPricingOptions: PricingOption[]
): { price: number; formattedPrice: string; label: string } => {
  const price = getDisplayPrice(bookingType, allPricingOptions);
  const formattedPrice = formatCurrency(price);
  const label = getDisplayLabel(bookingType);

  return { price, formattedPrice, label };
};
