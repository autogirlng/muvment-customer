import NetworkService from "@/components/Network/NetworkService";
import ApiClient from "./appClient";
import {toast} from "react-toastify"

const cache: Record<string, any> = {};

class LoadingManager {
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

    this.loadingElement = document.createElement("div");
    this.loadingElement.id = "api-loading-overlay";
    this.loadingElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

    // Popup container
    const popup = document.createElement("div");
    popup.style.cssText = `
    background: white;
    padding: 40px 50px;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(226, 232, 240, 1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    text-align: center;
    transform: scale(0.9);
    animation: popIn 0.3s ease forwards;
    min-width: 320px;
  `;

    // Logo
    const logoContainer = document.createElement("div");
    logoContainer.style.cssText = `
    position: relative;
    width: 80px;
    height: 80px;
  `;

    const logo = document.createElement("div");
    logo.style.cssText = `
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(145deg, #3b82f6, #2563eb);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 32px;
    font-weight: bold;
    letter-spacing: 1px;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
    animation: glowPulse 2s infinite ease-in-out;
    position: relative;
    z-index: 2;
  `;
    logo.textContent = "M";

    const logoInner = document.createElement("div");
    logoInner.style.cssText = `
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3b82f6;
    font-size: 28px;
    font-weight: 900;
  `;
    logoInner.textContent = "M";
    logo.appendChild(logoInner);
    logoContainer.appendChild(logo);

    // Brand name
    const brandName = document.createElement("h2");
    brandName.textContent = "Muvment";
    brandName.style.cssText = `
    margin: 0;
    font-size: 32px;
    font-weight: 900;
    background: linear-gradient(90deg, #3b82f6, #2563eb);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
  `;

    // Message
    const message = document.createElement("p");
    message.textContent = "Loading your request...";
    message.style.cssText = `
    margin: 0;
    font-size: 15px;
    font-weight: 500;
    color: #64748b;
    animation: fadeIn 1s ease forwards;
  `;

    // Road container
    const roadContainer = document.createElement("div");
    roadContainer.style.cssText = `
    width: 280px;
    height: 80px;
    position: relative;
    margin-top: 10px;
  `;

    // Road
    const road = document.createElement("div");
    road.style.cssText = `
    width: 100%;
    height: 4px;
    background: #e2e8f0;
    border-radius: 4px;
    position: absolute;
    bottom: 10px;
    overflow: hidden;
  `;

    const roadGlow = document.createElement("div");
    roadGlow.style.cssText = `
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), transparent);
    animation: roadShine 2s linear infinite;
  `;
    road.appendChild(roadGlow);

    // Car
    const car = document.createElement("div");
    car.style.cssText = `
    position: absolute;
    bottom: 10px;
    left: 0;
    animation: carDrive 3s ease-in-out infinite;
  `;

    const carImage = document.createElement("img");
    carImage.src = "/images/spinner.png"; // <-- replace with your actual image path
    carImage.alt = "car";
    carImage.style.cssText = `
    width: 80px;
    height: auto;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    transform: scaleX(1); /* make sure the car faces right */
  `;

    // Exhaust smoke
    const smoke = document.createElement("div");
    smoke.style.cssText = `
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 8px;
    background: rgba(148, 163, 184, 0.3);
    border-radius: 50%;
    filter: blur(4px);
    animation: exhaust 1s ease-out infinite;
  `;

    car.appendChild(smoke);
    car.appendChild(carImage);
    roadContainer.appendChild(road);
    roadContainer.appendChild(car);

    // Animations
    const style = document.createElement("style");
    style.textContent = `
    @keyframes glowPulse {
      0%, 100% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3); }
      50% { box-shadow: 0 4px 30px rgba(59, 130, 246, 0.5); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes roadShine {
      from { transform: translateX(-100%); }
      to { transform: translateX(200%); }
    }
    @keyframes carDrive {
      0% { left: 0; }
      100% { left: calc(100% - 90px); }
    }
    @keyframes exhaust {
      0% {
        opacity: 0.5;
        transform: translateY(-50%) scale(0);
        left: -8px;
      }
      100% {
        opacity: 0;
        transform: translateY(-50%) scale(1.5);
        left: -25px;
      }
    }
  `;
    document.head.appendChild(style);

    // Assemble
    popup.appendChild(logoContainer);
    popup.appendChild(brandName);
    popup.appendChild(message);
    popup.appendChild(roadContainer);
    this.loadingElement.appendChild(popup);
    document.body.appendChild(this.loadingElement);
  }

  private removeLoadingElement(): void {
    if (this.loadingElement) {
      document.body.removeChild(this.loadingElement);
      this.loadingElement = null;
    }
  }
}

const withLoading = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  const loadingManager = LoadingManager.getInstance();

  try {
    loadingManager.showLoading();
    const result = await apiCall();
    return result;
  } finally {
    loadingManager.hideLoading();
  }
};

export const getTableData = async (path: string, params?: any) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) return;

    try {
      const [data] = await ApiClient.request(path, {
        method: "GET",
        requireAuth: true,
        params,
      });

      const response = NetworkService.handleApiResponse(data);
      return response;
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};

export const getSingleData = async (path: string, params?: any) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) return;

    try {
      const [data] = await ApiClient.request(path, {
        method: "GET",
        requireAuth: true,
        params,
      });
      return NetworkService.handleApiResponse([data]);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};

export const deleteData = async (path: string, id?: string) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) return;

    try {
      const fullPath = id ? `${path}/${id}` : path;

      const [data] = await ApiClient.request(fullPath, {
        method: "DELETE",
        requireAuth: true,
      });

      return NetworkService.handleApiResponse(data);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};

export const deleteItem = async (path: string, body?: any) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) return;

    try {
      const [data] = await ApiClient.request(path, {
        method: "DELETE",
        body, // Include the request body
        requireAuth: true,
      });
      return NetworkService.handleApiResponse(data);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};
export const deleteWithParams = async (path: string, params?: any) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) return;

    try {
      const [data] = await ApiClient.request(path, {
        method: "DELETE",
        params, // Include the request body
        requireAuth: true,
      });
      return NetworkService.handleApiResponse(data);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};

export const createData = async (path: string, body: any) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) return;
    const validation = validateDataInput(body);
    if (validation.error) return validation;

    try {
      const isFormData = body instanceof FormData;

      const [data] = await ApiClient.request(path, {
        method: "POST",
        body,
        headers: isFormData
          ? {} // Axios will auto set Content-Type with FormData
          : { "Content-Type": "application/json;charset=UTF-8" },
        requireAuth: true,
      });
 
      if(data.err){
        toast.error(data.err)
      }

      return NetworkService.handleApiResponse(data);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};

export const createDataWithParams = async (path: string, params?: any) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) return;
    try {
      const [data] = await ApiClient.request(path, {
        method: "POST",
        params,
        requireAuth: true,
      });

      if(data.err){
        toast.error(data.err)
      }
      return NetworkService.handleApiResponse(data);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};

export const updateMapper = async (path: string, body: any) => {
  try {
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
  } catch (error) {
    console.error(error);
    return NetworkService.handleApiError(error);
  }
};

export const patchWithoutParams = async (
  path: string,
  data: Record<string, any> = {}
) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) return;
    try {
      const [response] = await ApiClient.request(path, {
        method: "PATCH",
        body: data, // <-- Attach the data to the request body
        requireAuth: true,
      });

      return NetworkService.handleApiResponse(response);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};
export const patchData = async (
  path: string,
  id: string,
  extraPath: string = "",
  data: Record<string, any> = {}, // <-- New parameter for request body
  queryParams?: Record<string, any>
) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) return;

    const query = queryParams
      ? "?" +
        Object.entries(queryParams)
          .map(
            ([key, val]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
          )
          .join("&")
      : "";

    const url = `${path}/${id}${extraPath}${query}`;

    try {
      const [response] = await ApiClient.request(url, {
        method: "PATCH",
        body: data, // <-- Attach the data to the request body
        requireAuth: true,
      });

      return NetworkService.handleApiResponse(response);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};
export const patchDataNoBody = async (path: string) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) return;

    const url = `${path}`;

    try {
      const [response] = await ApiClient.request(url, {
        method: "PATCH",
        requireAuth: true,
      });

      return NetworkService.handleApiResponse(response);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};

export const updateData = async (path: string, id: string, body: any) => {
  return withLoading(async () => {
    const validation = validateDataInput(body);
    if (validation.error) return validation;

    if (!NetworkService.checkConnection()) return;

    try {
      const [data] = await ApiClient.request(`${path}/${id}`, {
        method: "PUT",
        body,
        requireAuth: true,
      });
      return NetworkService.handleApiResponse(data);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};

export const updateDataNotification = async (
  path: string,
  id: string,
  read: boolean
) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) return;

    try {
      const fullPath = `${path}/${id}?read=${read}`;

      const [data] = await ApiClient.request(fullPath, {
        method: "PUT",
        requireAuth: true,
      });

      return NetworkService.handleApiResponse(data);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};

export const updateDataFormWithIDParams = async (
  path: string,
  id: string,
  body: any
) => {
  return withLoading(async () => {
    const validation = validateDataInput(body);
    if (validation.error) return validation;

    if (!NetworkService.checkConnection()) return;

    try {
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
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};

export const updateDataFormWithNoIDPath = async (path: string, body: any) => {
  return withLoading(async () => {
    const validation = validateDataInput(body);
    if (validation.error) return validation;

    if (!NetworkService.checkConnection()) return;

    try {
      const [data] = await ApiClient.request(`${path}`, {
        method: "PUT",
        body: body,
        requireAuth: true,
      });
      return NetworkService.handleApiResponse(data);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};

export const updateDataFormWithNoIDPathNew = async (
  path: string,
  body: any
) => {
  return withLoading(async () => {
    const validation = validateDataInput(body);
    if (validation.error) return validation;

    if (!NetworkService.checkConnection()) return;

    try {
      console.log("updateDataFormWithNoIDPathNew", body);
      const [data] = await ApiClient.request(`${path}`, {
        method: "PUT",
        body,
        requireAuth: true,
      });
      return NetworkService.handleApiResponse(data);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};

export const updateDataForm = async (path: string, id: string, body: any) => {
  return withLoading(async () => {
    const validation = validateDataInput(body);
    if (validation.error) return validation;

    if (!NetworkService.checkConnection()) return;

    try {
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
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};

export const updateKycRequirementMapping = async (path: string, body: any) => {
  const validation = validateDataInput(body);
  if (validation.error) return validation;

  if (!NetworkService.checkConnection()) return;

  try {
    const [data] = await ApiClient.request(`${path}`, {
      method: "PUT",
      body,
      requireAuth: true,
    });
    return NetworkService.handleApiResponse(data);
  } catch (error) {
    return NetworkService.handleApiError(error);
  }
};

export const updateDataFormWithNoID = async (path: string, body: any) => {
  return withLoading(async () => {
    const validation = validateDataInput(body);
    if (validation.error) return validation;

    if (!NetworkService.checkConnection()) return;

    try {
      const [data] = await ApiClient.request(`${path}`, {
        method: "PUT",
        body: body,
        requireAuth: true,
      });
      return NetworkService.handleApiResponse(data);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};
export const updateDataFormWithID = async (path: string) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) return;
    try {
      const [data] = await ApiClient.request(`${path}`, {
        method: "PUT",
        requireAuth: true,
      });
      return NetworkService.handleApiResponse(data);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
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
    /('|--|;|\/\*|\*\/|#)/,
    /(\bOR\b.+\=.+)/i,
  ];

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === "") {
      result.message = `Field "${key}" is required.`;
      result.error = true;
      return result;
    }

    const valueStr = String(value);
    if (sqlInjectionPatterns.some((regex) => regex.test(valueStr))) {
      result.message = `Potential SQL injection detected in field "${key}".`;
      result.error = true;
      return result;
    }
  }

  return { data, message: "Validation passed", error: false };
};

export const AuthController = async (
  path: string,
  body?: any,
  requireAuth: boolean = false
) => {
  return withLoading(async () => {
    const validation = validateDataInput(body);
    if (validation.error) return validation;

    if (!NetworkService.checkConnection()) return;

    try {
      const [data] = await ApiClient.request(path, {
        method: "POST",
        body,
        requireAuth,
      });
      return NetworkService.handleApiResponse(data);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};

export const AuthForgotPasswordController = async (
  path: string,
  requireAuth: boolean = false
) => {
  return withLoading(async () => {
    if (!NetworkService.checkConnection()) return;

    try {
      const [data] = await ApiClient.request(path, {
        method: "POST",
        requireAuth,
      });
      return NetworkService.handleApiResponse(data);
    } catch (error) {
      return NetworkService.handleApiError(error);
    }
  });
};
