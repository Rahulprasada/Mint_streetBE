import axios, { AxiosInstance, AxiosResponse } from "axios";

// Define types
interface Index {
  symbols: string[];
  exchange_suffix: string;
}

interface ValidationResult {
  valid_symbols: string[];
  invalid_symbols: Record<string, string>;
}

interface ScreeningResult {
  Converged: boolean;
  [key: string]: any; // Allow additional result properties
}

interface Config {
  period: string;
  interval: string;
  features: string[];
  available_features: string[];
  window: number;
  max_states: number;
  train_window: number;
  use_rolling_window: boolean;
  sma_period?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}


export interface ScreenerApiParams {
  symbols: string[];
  period?: string;
  interval?: string;
  // Add other parameters your API accepts
}


// Use the environment variable for the API URL with a fallback
const API_URL =
  typeof process !== "undefined" && process.env.REACT_APP_API_URL
    ? "kk"
    : "http://localhost:8000/api/";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 300000, // Increased timeout for potentially long screening tasks (5 minutes)
});

// Add a request interceptor to log requests
api.interceptors.request.use(
  (request) => {
    console.log("Starting Request", request);
    return request;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    console.log("Response:", response);
    return response;
  },
  (error) => {
    console.error("Response Error:", error.response || error.message || error);
    return Promise.reject(error);
  }
);

export interface ScreenerResult {
  Stock: string;
  Recommendation?: 'BUY' | 'SELL' | 'HOLD' | 'STRONG BUY' | 'INCONCLUSIVE' | 'ERROR' | 'ERROR_UNEXPECTED';
  'Calmar Ratio'?: number;
  'Max Drawdown (%)'?: number;
  'Latest Regime'?: string;
  Converged?: boolean;
  Error?: string | null;
  // Add all other fields from your Python DEFAULT_RESULT dictionary
  [key: string]: any; 
}
const API_BASE_URL = 'http://localhost:8000';

export const runScreenerAPI = async (params: ScreenerApiParams): Promise<ScreenerResult[]> => {
  // Use the URL constructor to safely join the correct path
  // This will create http://localhost:8000/api/screen_stocks/
  const url = new URL('api/screen_stocks/', API_BASE_URL);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch screener results from the API.');
  }

  return response.json();
};
// --- API Endpoints ---

/**
 * Fetches the list of predefined indices.
 * @returns {Promise<Record<string, Index>>} Object containing index names and symbols.
 */
export const getIndices = async (): Promise<Record<string, Index>> => {
  try {
    const response: AxiosResponse<Record<string, Index>> = await api.get("indices/");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching indices:", error);
    throw error;
  }
};

/**
 * Validates a list of stock symbols.
 * @param symbols - Array of stock symbols (without suffix).
 * @param suffix - The exchange suffix (e.g., '.NS').
 * @returns {Promise<ValidationResult>} Valid and invalid symbols.
 */
export const validateSymbols = async (
  symbols: string[],
  suffix: string
): Promise<ValidationResult> => {
  try {
    const response: AxiosResponse<ValidationResult> = await api.post("validate_symbols/", {
      symbols,
      exchange_suffix: suffix,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error validating symbols:", error);
    throw error;
  }
};

/**
 * Sends screening parameters to the backend to run the screener.
 * @param params - Screening parameters.
 * @returns {Promise<ScreeningResult[]>} Array of screening result objects.
 */
export const screenStocks = async (params: any): Promise<ScreeningResult[]> => {
  try {
    const response: AxiosResponse<ScreeningResult[]> = await api.post("screen_stocks/", params);
    return response.data;
  } catch (error: any) {
    console.error("Error screening stocks:", error);
    throw error;
  }
};

/**
 * Fetches the last lines of the backend log file.
 * @returns {Promise<string>} Log file content.
 */
export const getLogs = async (): Promise<string> => {
  try {
    const response: AxiosResponse<string> = await api.get("logs/");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching logs:", error);
    throw error;
  }
};

/**
 * Fetches the current backend configuration.
 * @returns {Promise<Config>} Configuration object.
 */
export const getConfig = async (): Promise<Config> => {
  try {
    const response: AxiosResponse<Config> = await api.get("config/");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching config:", error);
    throw error;
  }
};

/**
 * Sends updated configuration to the backend to save.
 * @param config - Configuration object to save.
 * @returns {Promise<ApiResponse<Config>>} Result of the save operation.
 */
export const saveConfig = async (config: Config): Promise<ApiResponse<Config>> => {
  try {
    const response: AxiosResponse<ApiResponse<Config>> = await api.post("config/", config);
    return response.data;
  } catch (error: any) {
    console.error("Error saving config:", error);
    throw error;
  }
};

/**
 * Requests the backend to clear the data cache.
 * @returns {Promise<ApiResponse<void>>} Result of the clear operation.
 */
export const clearCache = async (): Promise<ApiResponse<void>> => {
  try {
    const response: AxiosResponse<ApiResponse<void>> = await api.post("clear_cache/");
    return response.data;
  } catch (error: any) {
    console.error("Error clearing cache:", error);
    throw error;
  }
};

/**
 * Registers a new user with the backend.
 * @param data - Object containing username, email, and password.
 * @returns {Promise<ApiResponse<any>>} Response message or errors.
 */
export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
}): Promise<ApiResponse<any>> => {
  try {
    const response: AxiosResponse<ApiResponse<any>> = await api.post("register/", data);
    return response.data;
  } catch (error: any) {
    console.error("Error registering user:", error);
    throw error;
  }
};

/**
 * Confirms a user's email with the token.
 * @param token - Confirmation token sent via email.
 * @returns {Promise<ApiResponse<any>>} Confirmation response.
 */
export const confirmEmail = async (token: string): Promise<ApiResponse<any>> => {
  try {
    const response: AxiosResponse<ApiResponse<any>> = await api.post("confirm-email/", {
      token,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error confirming email:", error);
    throw error;
  }
};

export default api;