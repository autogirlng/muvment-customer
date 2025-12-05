import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  AuthForgotPasswordController,
  createDataWithParams,
  deleteItem,
  deleteWithParams,
  LoadingManager,
  updateDataNotification,
  updateMapper,
  getTableData,
  getSingleData,
  createData,
  updateData,
  deleteData,
  patchData,
  AuthController,
} from "./app.callers";

export const queryKeys = {
  table: (path: string, params?: any) => [path, params],
  single: (path: string, params?: any) => ["single", path, params],
  list: (path: string, filters?: any) => ["list", path, filters],
  detail: (path: string, id: string) => ["detail", path, id],
};

const useMutationWithLoading = (options?: { showLoading?: boolean }) => {
  const loadingManager = LoadingManager.getInstance();
  const showLoading = options?.showLoading ?? true;

  return {
    onMutate: () => {
      if (showLoading) loadingManager.showLoading();
    },
    onSettled: () => {
      if (showLoading) loadingManager.hideLoading();
    },
    onError: () => {
      if (showLoading) loadingManager.hideLoading();
    },
  };
};

// In app.hooks.ts

// Update useGetTableData
export const useGetTableData = (
  path: string,
  params?: any,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
  }
) => {
  const loadingManager = LoadingManager.getInstance();

  return useQuery({
    queryKey: queryKeys.table(path, params),
    queryFn: async () => {
      loadingManager.showLoading();
      try {
        return await getTableData(path, params);
      } finally {
        loadingManager.hideLoading();
      }
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime,
    gcTime: options?.cacheTime,
  });
};

// Update useGetSingleData
export const useGetSingleData = (
  path: string,
  params?: any,
  options?: {
    enabled?: boolean;
  }
) => {
  const loadingManager = LoadingManager.getInstance();

  return useQuery({
    queryKey: queryKeys.single(path, params),
    queryFn: async () => {
      loadingManager.showLoading();
      try {
        return await getSingleData(path, params);
      } finally {
        loadingManager.hideLoading();
      }
    },
    enabled: options?.enabled ?? true,
  });
};

// Mutation hooks
export const useCreateData = (
  path: string,
  options?: { showLoading?: boolean }
) => {
  const queryClient = useQueryClient();
  const loadingUtils = useMutationWithLoading(options);

  return useMutation({
    mutationFn: (body: any) => createData(path, body),
    onMutate: loadingUtils.onMutate,
    onSettled: loadingUtils.onSettled,
    onError: loadingUtils.onError,
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [path] });
    },
  });
};

export const useUpdateData = (
  path: string,
  id: string,
  options?: { showLoading?: boolean }
) => {
  const queryClient = useQueryClient();
  const loadingUtils = useMutationWithLoading(options);

  return useMutation({
    mutationFn: (body: any) => updateData(path, id, body),
    onMutate: loadingUtils.onMutate,
    onSettled: loadingUtils.onSettled,
    onError: loadingUtils.onError,
    onSuccess: () => {
      // Invalidate specific item and list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(path, id) });
      queryClient.invalidateQueries({ queryKey: [path] });
    },
  });
};

export const useDeleteData = (
  path: string,
  options?: { showLoading?: boolean }
) => {
  const queryClient = useQueryClient();
  const loadingUtils = useMutationWithLoading(options);

  return useMutation({
    mutationFn: (id?: string) => deleteData(path, id),
    onMutate: loadingUtils.onMutate,
    onSettled: loadingUtils.onSettled,
    onError: loadingUtils.onError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [path] });
    },
  });
};

export const useDeleteItem = (
  path: string,
  options?: { showLoading?: boolean }
) => {
  const queryClient = useQueryClient();
  const loadingUtils = useMutationWithLoading(options);

  return useMutation({
    mutationFn: (body?: any) => deleteItem(path, body),
    onMutate: loadingUtils.onMutate,
    onSettled: loadingUtils.onSettled,
    onError: loadingUtils.onError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [path] });
    },
  });
};

export const useDeleteWithParams = (
  path: string,
  options?: { showLoading?: boolean }
) => {
  const queryClient = useQueryClient();
  const loadingUtils = useMutationWithLoading(options);

  return useMutation({
    mutationFn: (params?: any) => deleteWithParams(path, params),
    onMutate: loadingUtils.onMutate,
    onSettled: loadingUtils.onSettled,
    onError: loadingUtils.onError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [path] });
    },
  });
};

export const usePatchData = (
  path: string,
  id: string,
  extraPath?: string,
  queryParams?: Record<string, any>,
  options?: { showLoading?: boolean }
) => {
  const queryClient = useQueryClient();
  const loadingUtils = useMutationWithLoading(options);

  return useMutation({
    mutationFn: (data: Record<string, any>) =>
      patchData(path, id, extraPath || "", data, queryParams),
    onMutate: loadingUtils.onMutate,
    onSettled: loadingUtils.onSettled,
    onError: loadingUtils.onError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(path, id) });
      queryClient.invalidateQueries({ queryKey: [path] });
    },
  });
};

export const useCreateDataWithParams = (
  path: string,
  options?: { showLoading?: boolean }
) => {
  const queryClient = useQueryClient();
  const loadingUtils = useMutationWithLoading(options);

  return useMutation({
    mutationFn: (params?: any) => createDataWithParams(path, params),
    onMutate: loadingUtils.onMutate,
    onSettled: loadingUtils.onSettled,
    onError: loadingUtils.onError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [path] });
    },
  });
};

export const useUpdateMapper = (
  path: string,
  options?: { showLoading?: boolean }
) => {
  const loadingUtils = useMutationWithLoading(options);

  return useMutation({
    mutationFn: (body: any) => updateMapper(path, body),
    onMutate: loadingUtils.onMutate,
    onSettled: loadingUtils.onSettled,
    onError: loadingUtils.onError,
  });
};

export const useUpdateDataNotification = (
  path: string,
  id: string,
  options?: { showLoading?: boolean }
) => {
  const queryClient = useQueryClient();
  const loadingUtils = useMutationWithLoading(options);

  return useMutation({
    mutationFn: (read: boolean) => updateDataNotification(path, id, read),
    onMutate: loadingUtils.onMutate,
    onSettled: loadingUtils.onSettled,
    onError: loadingUtils.onError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(path, id) });
    },
  });
};

export const useAuth = (
  path: string,
  requireAuth: boolean = false,
  options?: { showLoading?: boolean }
) => {
  const loadingUtils = useMutationWithLoading(options);

  return useMutation({
    mutationFn: (body: any) => AuthController(path, body, requireAuth),
    onMutate: loadingUtils.onMutate,
    onSettled: loadingUtils.onSettled,
    onError: loadingUtils.onError,
  });
};

export const useAuthForgotPassword = (
  path: string,
  requireAuth: boolean = false,
  options?: { showLoading?: boolean }
) => {
  const loadingUtils = useMutationWithLoading(options);

  return useMutation({
    mutationFn: () => AuthForgotPasswordController(path, requireAuth),
    onMutate: loadingUtils.onMutate,
    onSettled: loadingUtils.onSettled,
    onError: loadingUtils.onError,
  });
};

// Hook for any other function (flexible wrapper)
export const useCustomMutation = <T, V = any>(
  mutationFn: (args: V) => Promise<T>,
  options?: {
    showLoading?: boolean;
    onSuccess?: (data: T, variables: V) => void;
    invalidateQueries?: string[];
  }
) => {
  const queryClient = useQueryClient();
  const loadingUtils = useMutationWithLoading(options);

  return useMutation({
    mutationFn,
    onMutate: loadingUtils.onMutate,
    onSettled: loadingUtils.onSettled,
    onError: loadingUtils.onError,
    onSuccess: (data, variables) => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
      options?.onSuccess?.(data, variables);
    },
  });
};
