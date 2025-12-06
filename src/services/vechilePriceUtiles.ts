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
  allPricingOptions: PricingOption[],
  bookingOptions: { value: string; label: string }[]
): number => {
  const bookingTypeOption = bookingOptions.find(
    (opt) => opt.value === bookingType
  );
  if (bookingType && allPricingOptions && allPricingOptions.length > 0) {
    const bookingTypePrice = allPricingOptions.find(
      (bt) => bt.bookingTypeName === bookingTypeOption?.label
    );

    return bookingTypePrice
      ? bookingTypePrice.price
      : allPricingOptions[0]?.price || 0;
  }

  return allPricingOptions?.[0]?.price || 0;
};

export const getDisplayLabel = (
  bookingType: string | null | undefined,
  bookingOptions: { value: string; label: string }[]
): string => {
  if (!bookingType || !bookingOptions?.length) return "Daily";
  const matched = bookingOptions.find((opt) => opt.value === bookingType);
  return matched?.label || "Daily";
};

export const getPriceDisplay = (
  bookingType: string | null | undefined,
  allPricingOptions: PricingOption[],
  bookingOptions: { value: string; label: string }[]
): { price: number; formattedPrice: string; label: string } => {
  const price = getDisplayPrice(bookingType, allPricingOptions, bookingOptions);
  const formattedPrice = formatCurrency(price);
  const label = getDisplayLabel(bookingType, bookingOptions);

  return { price, formattedPrice, label };
};
