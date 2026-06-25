import { useQuery } from "@tanstack/react-query";
import { getSingleData } from "@/controllers/connnector/app.callers";

export const useInvoiceCheckout = (invoiceNumber: string) => {
  const {
    data: invoiceData,
    isLoading: isInvoiceLoading,
    isError: isInvoiceError,
    error: invoiceError,
  } = useQuery({
    queryKey: ["invoice", invoiceNumber],
    queryFn: async () => {
      const response = await getSingleData(
        `/api/v1/public/bookings/invoice/${invoiceNumber}`,
      );

      const rawData =
        response?.data?.data ||
        response?.data?.[0]?.data ||
        response?.data ||
        response;

      if (rawData?.err || !rawData) {
        throw new Error(rawData?.err || "Failed to fetch invoice");
      }

      return rawData;
    },
    refetchInterval: 10000,
    enabled: !!invoiceNumber,
  });

  const vehicleId = invoiceData?.vehicle?.id;

  const { data: vehicleData, isLoading: isVehicleLoading } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: async () => {
      const response = await getSingleData(
        `/api/v1/public/vehicles/${vehicleId}`,
      );
      return response?.data?.[0]?.data || response?.data || null;
    },
    enabled: !!vehicleId,
    staleTime: Infinity,
    refetchInterval: false,
  });

  return {
    invoice: invoiceData,
    vehicle: vehicleData,
    isLoading: isInvoiceLoading,
    isError: isInvoiceError,
    error: invoiceError,
    isVehicleLoading,
  };
};
