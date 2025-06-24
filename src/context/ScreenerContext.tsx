import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "./api";

// Define types
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

interface ScreenerParams {
  symbols: string[];
  period: string;
  interval: string;
  feature_sets: string[][];
  window: number;
  max_states: number;
  train_window: number;
  exchange_suffix: string;
  use_rolling_window: boolean;
  slippage: number;
}

interface StockResult {
  Converged: boolean;
  [key: string]: any; // Allow additional result properties
}

interface ScreenerContextType {
  results: StockResult[] | null;
  isLoading: boolean;
  error: string | null;
  selectedStockResult: StockResult | null;
  initialConfig: Config | null;
  showLogsPanel: boolean;
  runScreener: (params: ScreenerParams) => Promise<void>;
  selectStock: (stockResult: StockResult) => void;
  saveConfig: (config: Config) => Promise<{ success: boolean; message?: string }>;
  loadConfig: () => Promise<Config>;
  clearCache: () => Promise<{ success: boolean; message?: string }>;
  toggleLogsPanel: () => void;
  closeLogsPanel: () => void;
  showStatus: (message: string, type: "info" | "success" | "warning" | "error") => void;
  statusMessage: string | null;
  statusMessageType: "info" | "success" | "warning" | "error" | null;
  clearStatus: () => void;
}

interface ScreenerProviderProps {
  children: ReactNode;
}

// Create context with default values
const ScreenerContext = createContext<ScreenerContextType>({
  results: null,
  isLoading: false,
  error: null,
  selectedStockResult: null,
  initialConfig: null,
  showLogsPanel: false,
  runScreener: () => Promise.resolve(),
  selectStock: () => {},
  saveConfig: () => Promise.resolve({ success: false, message: "Not implemented" }),
  loadConfig: () => Promise.resolve({} as Config),
  clearCache: () => Promise.resolve({ success: false, message: "Not implemented" }),
  toggleLogsPanel: () => {},
  closeLogsPanel: () => {},
  showStatus: () => {},
  statusMessage: null,
  statusMessageType: null,
  clearStatus: () => {},
});

// Create the Provider component
export const ScreenerProvider = ({ children }: ScreenerProviderProps) => {
  const [results, setResults] = useState<StockResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStockResult, setSelectedStockResult] = useState<StockResult | null>(null);
  const [initialConfig, setInitialConfig] = useState<Config | null>(null);
  const [showLogsPanel, setShowLogsPanel] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusMessageType, setStatusMessageType] = useState<
    "info" | "success" | "warning" | "error" | null
  >(null);

  const navigate = useNavigate();

  const showStatus = (
    message: string,
    type: "info" | "success" | "warning" | "error"
  ) => {
    setStatusMessage(message);
    setStatusMessageType(type);
  };

  const clearStatus = () => {
    setStatusMessage(null);
    setStatusMessageType(null);
  };

  useEffect(() => {
    const loadInitialConfig = async () => {
      try {
        const config = await api.getConfig();
        setInitialConfig(config);
        console.log("Initial config loaded:", config);
      } catch (err: any) {
        console.error("Failed to load initial config:", err);
        showStatus(`Failed to load initial configuration: ${err.message}`, "error");
        setInitialConfig({
          period: "2y",
          interval: "1d",
          features: ["Returns", "Momentum", "Volatility"],
          window: 3,
          max_states: 2,
          train_window: 252,
          use_rolling_window: false,
          available_features: [
            "Returns",
            "Momentum",
            "ShortMomentum",
            "VolumeSpike",
            "Volatility",
            "ATR",
            "RSI",
            "RelVolume",
            "Breakout",
            "Anomaly",
          ],
        });
      }
    };
    loadInitialConfig();
  }, []);

  const runScreener = async (params: ScreenerParams) => {
    console.log("Running screener with params:", params);
    setIsLoading(true);
    setError(null);
    setResults(null);
    setSelectedStockResult(null);
    clearStatus();

    try {
      const screeningResults = await api.screenStocks(params);
      setResults(screeningResults);

      const firstConverged = screeningResults.find((r: StockResult) => r.Converged);
      if (firstConverged) {
        setSelectedStockResult(firstConverged);
      } else if (screeningResults.length > 0) {
        setSelectedStockResult(screeningResults[0]);
      }

      showStatus(`Screening complete for ${screeningResults.length} stocks.`, "success");
    } catch (err: any) {
      console.error("Screening failed:", err);
      const errMsg = err.response?.data?.error || err.message || "An unexpected error occurred.";
      setError(`Screening failed: ${errMsg}`);
      showStatus(`Screening failed: ${errMsg}`, "error");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectStock = (stockResult: StockResult) => {
    setSelectedStockResult(stockResult);
  }

  const saveConfig = async (config: Config) => {
    console.log("Saving config:", config);
    clearStatus();
    try {
      const result = await api.saveConfig(config);
      console.log("Save config result:", result);
      if (result.success) {
        showStatus("Configuration saved!", "success");
      } else {
        showStatus(`Failed to save configuration: ${result.message}`, "error");
      }
      return result;
    } catch (err: any) {
      console.error("Failed to save config:", err);
      showStatus(`Failed to save configuration: ${err.message}`, "error");
      throw err;
    }
  };

  const loadConfig = async () => {
    console.log("Loading config...");
    clearStatus();
    try {
      const config = await api.getConfig();
      setInitialConfig(config);
      showStatus("Configuration loaded!", "success");
      console.log("Loaded config:", config);
      return config;
    } catch (err: any) {
      console.error("Failed to load config:", err);
      showStatus(`Failed to load configuration: ${err.message}`, "error");
      throw err;
    }
  };

  const clearCache = async () => {
    console.log("Clearing data cache...");
    clearStatus();
    try {
      const result = await api.clearCache();
      console.log("Clear cache result:", result);
      if (result.success) {
        showStatus("Data cache cleared!", "success");
      } else {
        showStatus(`Failed to clear cache: ${result.message}`, "error");
      }
      return result;
    } catch (err: any) {
      console.error("Failed to clear cache:", err);
      showStatus(`Failed to clear cache: ${err.message}`, "error");
      throw err;
    }
  };

  const toggleLogsPanel = () => {
    setShowLogsPanel((prev) => !prev);
    clearStatus();
  };

  const closeLogsPanel = () => {
    setShowLogsPanel(false);
    clearStatus();
  };

  const contextValue: ScreenerContextType = {
    results,
    isLoading,
    error,
    selectedStockResult,
    initialConfig,
    showLogsPanel,
    runScreener,
    selectStock,
    saveConfig,
    loadConfig,
    clearCache,
    toggleLogsPanel,
    closeLogsPanel,
    showStatus,
    statusMessage,
    statusMessageType,
    clearStatus,
  };

  return <ScreenerContext.Provider value={contextValue}>{children}</ScreenerContext.Provider>;
};

// Create the consumer hook
export const useScreener = () => useContext(ScreenerContext);