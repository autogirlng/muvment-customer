import ApiClient from "@/controllers/connnector/appClient";
import NetworkService from "@/components/Network/NetworkService";

const withLoading = async (fn: Function) => fn();

export const getSingleData = async (
  path: string,
  params?: any,
  requireAuth = true
) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) return;

    try {
      const [data] = await ApiClient.request(path, {
        method: "GET",
        requireAuth: requireAuth,
        params,
      });

      return NetworkService.handleApiResponse(data);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};
