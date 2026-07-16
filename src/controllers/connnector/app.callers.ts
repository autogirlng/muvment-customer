import NetworkService from "@/components/Network/NetworkService";
import ApiClient from "./appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const cache: Record<string, any> = {};
export class LoadingManager {
  private static instance: LoadingManager;
  private loadingCount: number = 0;
  private loadingElement: HTMLDivElement | null = null;

  static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager();
    }
    return LoadingManager.instance;
  }

  showLoading(): void {
    this.loadingCount++;

    if (this.loadingCount === 1) {
      this.createLoadingElement();
    }
  }

  hideLoading(): void {
    this.loadingCount = Math.max(0, this.loadingCount - 1);

    if (this.loadingCount === 0) {
      this.removeLoadingElement();
    }
  }

  private createLoadingElement(): void {
    this.removeLoadingElement();

    if (typeof document === "undefined") return;

    if (!document.getElementById("mv-loader-keyframes")) {
      const style = document.createElement("style");
      style.id = "mv-loader-keyframes";
      style.textContent =
        "@keyframes mv-spin { to { transform: rotate(360deg); } }";
      document.head.appendChild(style);
    }

    this.loadingElement = document.createElement("div");
    this.loadingElement.id = "api-loading-overlay";
    this.loadingElement.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    z-index: 9999;
  `;

    const logo = document.createElement("img");
    logo.src = "/images/image.png";
    logo.alt = "Muvment";
    logo.style.cssText = "width: 144px; height: auto; object-fit: contain;";

    const spinner = document.createElement("span");
    spinner.setAttribute("role", "status");
    spinner.setAttribute("aria-label", "Loading");
    spinner.style.cssText = `
    display: block;
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top-color: #0673ff;
    border-radius: 9999px;
    animation: mv-spin 0.8s linear infinite;
  `;

    this.loadingElement.appendChild(logo);
    this.loadingElement.appendChild(spinner);
    document.body.appendChild(this.loadingElement);
  }


  private removeLoadingElement(): void {
    if (this.loadingElement) {
      document.body.removeChild(this.loadingElement);
      this.loadingElement = null;
    }
  }
}

export const withLoading = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  const loadingManager = LoadingManager.getInstance();

  try {
    loadingManager.showLoading();
    const result = await apiCall();
    return result;
  } finally {
    loadingManager.hideLoading();
  }
};

// Query functions (without loading wrapper - TanStack will handle loading)
export const getTableData = async (path: string, params?: any) => {
  if (!NetworkService.checkConnection()) throw new Error("No connection");
  const [data] = await ApiClient.request(path, {
    method: "GET",
    requireAuth: true,
    params,
  });
  return NetworkService.handleApiResponse(data);
};

export const getTableDataBlob = async (path: string, params?: any) => {
  if (!NetworkService.checkConnection()) throw new Error("No connection");
  const [data] = await ApiClient.request(path, {
    method: "GET",
    requireAuth: true,
    params,
  });
  return data;
};

export const getSingleData = async (
  path: string,
  params?: any,
  options?: { silent?: boolean },
) => {
  if (typeof window !== "undefined" && !NetworkService.checkConnection()) {
    throw new Error("No connection");
  }
  const [data] = await ApiClient.request(path, {
    method: "GET",
    requireAuth: true,
    params,
    silent: options?.silent,
  });
  return NetworkService.handleApiResponse([data]);
};

export const deleteData = async (path: string, id?: string) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");

    const fullPath = id ? `${path}/${id}` : path;
    const [data] = await ApiClient.request(fullPath, {
      method: "DELETE",
      requireAuth: true,
    });

    return NetworkService.handleApiResponse(data);
  });
};

export const deleteItem = async (path: string, body?: any) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");

    const [data] = await ApiClient.request(path, {
      method: "DELETE",
      body,
      requireAuth: true,
    });
    return NetworkService.handleApiResponse(data);
  });
};

export const deleteWithParams = async (path: string, params?: any) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");

    const [data] = await ApiClient.request(path, {
      method: "DELETE",
      params,
      requireAuth: true,
    });
    return NetworkService.handleApiResponse(data);
  });
};

export const createData = async (
  path: string,
  body: any,
  options?: { silent?: boolean; requireAuth?: boolean; skipLoader?: boolean },
) => {
  const run = async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");
    // const validation = validateDataInput(body);
    // if (validation.error) return validation;

    try {
      const isFormData = body instanceof FormData;

      const [data] = await ApiClient.request(path, {
        method: "POST",
        body,
        headers: isFormData
          ? {}
          : { "Content-Type": "application/json;charset=UTF-8" },
        requireAuth: options?.requireAuth ?? true,
        silent: options?.silent,
      });

      if (data.err && !options?.silent) {
        toast.error(data.err);
      }

      return NetworkService.handleApiResponse(data);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  };
  return options?.skipLoader ? run() : withLoading(run);
};

export const createDataWithParams = async (path: string, params?: any) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");

    const [data] = await ApiClient.request(path, {
      method: "POST",
      params,
      requireAuth: true,
    });

    return NetworkService.handleApiResponse(data);
  });
};

export const updateMapper = async (path: string, body: any) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");

    const isFormData = body instanceof FormData;
    const [data] = await ApiClient.request(path, {
      method: "PUT",
      body: body,
      headers: isFormData
        ? {}
        : { "Content-Type": "application/json;charset=UTF-8" },
      requireAuth: true,
    });

    return NetworkService.handleApiResponse(data);
  });
};

export const patchWithoutParams = async (
  path: string,
  data: Record<string, any> = {},
) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");

    const [response] = await ApiClient.request(path, {
      method: "PATCH",
      body: data,
      requireAuth: true,
    });

    return NetworkService.handleApiResponse(response);
  });
};

export const patchData = async (
  path: string,
  id: string,
  extraPath: string = "",
  data: Record<string, any> = {},
  queryParams?: Record<string, any>,
) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");

    const query = queryParams
      ? "?" +
        Object.entries(queryParams)
          .map(
            ([key, val]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(val)}`,
          )
          .join("&")
      : "";

    const url = `${path}/${id}${extraPath}${query}`;

    const [response] = await ApiClient.request(url, {
      method: "PATCH",
      body: data,
      requireAuth: true,
    });

    return NetworkService.handleApiResponse(response);
  });
};

export const patchDataNoBody = async (path: string) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");

    const url = `${path}`;
    const [response] = await ApiClient.request(url, {
      method: "PATCH",
      requireAuth: true,
    });

    return NetworkService.handleApiResponse(response);
  });
};

export const updateData = async (
  path: string,
  id: string,
  body: any,
  options?: { silent?: boolean; requireAuth?: boolean; skipLoader?: boolean },
) => {
  const run = async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");
    const validation = validateDataInput(body);
    if (validation.error) return validation;

    const [data] = await ApiClient.request(`${path}/${id}`, {
      method: "PUT",
      body,
      requireAuth: options?.requireAuth ?? true,
      silent: options?.silent,
    });
    return NetworkService.handleApiResponse(data);
  };
  return options?.skipLoader ? run() : withLoading(run);
};

export const updateDataNotification = async (
  path: string,
  id: string,
  read: boolean,
) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");

    const fullPath = `${path}/${id}?read=${read}`;
    const [data] = await ApiClient.request(fullPath, {
      method: "PUT",
      requireAuth: true,
    });

    return NetworkService.handleApiResponse(data);
  });
};

export const updateDataFormWithIDParams = async (
  path: string,
  id: string,
  body: any,
) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");
    const validation = validateDataInput(body);
    if (validation.error) return validation;

    const requestBody = {
      body: {
        ...body,
      },
    };

    const [data] = await ApiClient.request(`${path}/${id}`, {
      method: "PUT",
      body: requestBody,
      requireAuth: true,
    });
    return NetworkService.handleApiResponse(data);
  });
};

export const updateDataFormWithNoIDPath = async (path: string, body: any) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");
    const validation = validateDataInput(body);
    if (validation.error) return validation;

    const [data] = await ApiClient.request(`${path}`, {
      method: "PUT",
      body: body,
      requireAuth: true,
    });
    return NetworkService.handleApiResponse(data);
  });
};

export const updateDataFormWithNoIDPathNew = async (
  path: string,
  body: any,
) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");
    const validation = validateDataInput(body);
    if (validation.error) return validation;

    const [data] = await ApiClient.request(`${path}`, {
      method: "PUT",
      body,
      requireAuth: true,
    });
    return NetworkService.handleApiResponse(data);
  });
};

export const updateDataForm = async (path: string, id: string, body: any) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");
    const validation = validateDataInput(body);
    if (validation.error) return validation;

    const requestBody = {
      body: {
        id,
        ...body,
      },
    };

    const [data] = await ApiClient.request(`${path}`, {
      method: "PUT",
      body: requestBody,
      requireAuth: true,
    });
    return NetworkService.handleApiResponse(data);
  });
};

export const updateKycRequirementMapping = async (path: string, body: any) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");
    const validation = validateDataInput(body);
    if (validation.error) return validation;

    const [data] = await ApiClient.request(`${path}`, {
      method: "PUT",
      body,
      requireAuth: true,
    });
    return NetworkService.handleApiResponse(data);
  });
};

export const updateDataFormWithNoID = async (path: string, body: any) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");
    const validation = validateDataInput(body);
    if (validation.error) return validation;

    const [data] = await ApiClient.request(`${path}`, {
      method: "PUT",
      body: body,
      requireAuth: true,
    });
    return NetworkService.handleApiResponse(data);
  });
};

export const updateDataFormWithID = async (path: string) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");

    const [data] = await ApiClient.request(`${path}`, {
      method: "PUT",
      requireAuth: true,
    });
    return NetworkService.handleApiResponse(data);
  });
};

export const validateDataInput = (data: Record<string, any>) => {
  const result = {
    data: null,
    message: "",
    error: false,
  };

  const sqlInjectionPatterns = [
    /(\b(SELECT|UPDATE|DELETE|INSERT|DROP|ALTER|EXEC|UNION|CREATE|TRUNCATE)\b)/i,
    /('|--|;|\/\*|\*\/)/,
    /(\bOR\b.+\=.+)/i,
    // Detect # preceded by quote (SQL comment injection attempt)
    /['"].*#/,
    // Detect # at end of string after quote (classic comment-out technique)
    /['"]#\s*$/,
    // Detect multiple dashes which could be SQL comments
    /--+/,
  ];

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === "") {
      result.message = `Field "${key}" is required.`;
      result.error = true;
      return result;
    }

    const valueStr = String(value);
    if (sqlInjectionPatterns.some((regex) => regex.test(valueStr))) {
      result.message = `Character validation error: Field "${key}" contains metacharacters that are restricted due to security policies.`;
      result.error = true;
      return result;
    }
  }

  return { data, message: "Validation passed", error: false };
};

export const AuthController = async (
  path: string,
  body?: any,
  requireAuth: boolean = false,
) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");
    const validation = validateDataInput(body);
    if (validation.error) return validation;

    const [data] = await ApiClient.request(path, {
      method: "POST",
      body,
      requireAuth,
    });
    return NetworkService.handleApiResponse(data);
  });
};

export const AuthForgotPasswordController = async (
  path: string,
  requireAuth: boolean = false,
) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) throw new Error("No connection");

    const [data] = await ApiClient.request(path, {
      method: "POST",
      requireAuth,
    });
    return NetworkService.handleApiResponse(data);
  });
};
