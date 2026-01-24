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
  bookingOptions: { value: string; label: string }[],
): number => {
  if (!allPricingOptions?.length) return 0;

  if (!bookingType) {
    return allPricingOptions[0].price;
  }

  const bookingTypeOption = bookingOptions.find(
    (opt) => opt.value === bookingType,
  );
  const bookingTypePrice = allPricingOptions.find(
    (bt) => bt.bookingTypeName === bookingTypeOption?.label,
  );

  return bookingTypePrice ? bookingTypePrice.price : allPricingOptions[0].price;
};

export const getDisplayLabel = (
  bookingType: string | null | undefined,
  bookingOptions: { value: string; label: string }[],
): string => {
  if (!bookingOptions?.length) return "";

  if (!bookingType) {
    return bookingOptions[0].label;
  }

  const matched = bookingOptions.find((opt) => opt.value === bookingType);
  return matched?.label || bookingOptions[0].label;
};

export const getPriceDisplay = (
  bookingType: string | null | undefined,
  allPricingOptions: PricingOption[],
  bookingOptions: { value: string; label: string }[],
): { price: number; formattedPrice: string; label: string } => {
  const price = getDisplayPrice(bookingType, allPricingOptions, bookingOptions);
  const formattedPrice = formatCurrency(price);
  const label = getDisplayLabel(bookingType, bookingOptions);

  return { price, formattedPrice, label };
};

export const getSelectedModelName = (
  selectedModels: string[] | undefined,
  models: any[],
): string | undefined => {
  if (!selectedModels || selectedModels.length === 0) return undefined;
  const model = models.find((m) => m.id === selectedModels[0]);
  return model?.name;
};

export const PriceRangeformatPrice = (price: number) => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M`.replace(".0M", "M");
  }
  if (price >= 1000) {
    return `${Math.round(price / 1000)}k`;
  }
  return price.toString();
};
