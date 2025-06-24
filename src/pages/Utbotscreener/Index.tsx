import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  PlayCircle,
  Upload,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Papa from "papaparse";
import { useScreener } from "../../context/ScreenerContext";
import { useAuth } from "../../context/AuthContext";
import {
  getIndices,
  getConfig,
  validateSymbols,
  screenStocks,
  getLogs,
  saveConfig,
  clearCache,
} from "../../context/api";

// MUI Components for ResultsTable
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import MuiTabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { CSVLink } from "react-csv";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface Index {
  symbols: string[];
  exchange_suffix: string;
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

interface Column {
  id: string;
  label: string;
  tooltip: string;
  format?: (value: any) => string;
}

const periodDays: Record<string, number> = {
  "1y": 252,
  "2y": 504,
  "5y": 1260,
  max: Infinity,
};

// StockChartMui Component
const StockChartMui: React.FC<{
  selectedStockResult: any;
  showPriceMA: boolean;
  showVolumeMA: boolean;
}> = ({ selectedStockResult, showPriceMA, showVolumeMA }) => (
  <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 1 }}>
    <Typography variant="body1">
      Chart for {selectedStockResult.Stock || selectedStockResult.stock} (Price
      MA: {showPriceMA.toString()}, Volume MA: {showVolumeMA.toString()})
    </Typography>
  </Box>
);

// BacktestMetricsMui Component
const BacktestMetricsMui: React.FC<{ backtestMetrics: any }> = ({
  backtestMetrics,
}) => (
  <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 1 }}>
    <Typography variant="body1">
      Backtest Metrics for {backtestMetrics.Stock || backtestMetrics.stock}
    </Typography>
  </Box>
);

const MotionTableRow = motion(TableRow);

const UtBotScreener = () => {
  const {
    runScreener,
    isLoading,
    error,
    initialConfig,
    statusMessage,
    statusMessageType,
    showStatus,
    results,
    selectStock,
    selectedStockResult,
  } = useScreener();
  const { user, isEmailConfirmed, loading: authLoading } = useAuth();

  const [symbolsInput, setSymbolsInput] = useState<string>(() => {
    return localStorage.getItem("screener_symbolsInput") || "";
  });
  const [inputMethod, setInputMethod] = useState<string>(() => {
    return localStorage.getItem("screener_inputMethod") || "Select Index";
  });
  const [selectedIndex, setSelectedIndex] = useState<string>(() => {
    return localStorage.getItem("screener_selectedIndex") || "";
  });
  const [exchangeSuffix, setExchangeSuffix] = useState<string>(() => {
    return localStorage.getItem("screener_exchangeSuffix") || ".NS";
  });
  const [period, setPeriod] = useState<string>(() => {
    return localStorage.getItem("screener_period") || initialConfig?.period || "2y";
  });
  const [interval, setInterval] = useState<string>(() => {
    return localStorage.getItem("screener_interval") || initialConfig?.interval || "1d";
  });
  const [features, setFeatures] = useState<string[]>(() => {
    const savedFeatures = localStorage.getItem("screener_features");
    if (savedFeatures) return JSON.parse(savedFeatures);
    if (initialConfig?.features && Array.isArray(initialConfig.features)) {
      const validLoadedFeatures = initialConfig.features.filter((f) =>
        (initialConfig.available_features || []).includes(f)
      );
      return validLoadedFeatures.length > 0
        ? validLoadedFeatures
        : ["Returns", "Momentum", "Volatility"];
    }
    return ["Returns", "Momentum", "Volatility"];
  });
  const [windowSize, setWindowSize] = useState<number>(() => {
    const savedWindowSize = localStorage.getItem("screener_windowSize");
    return savedWindowSize ? Number(savedWindowSize) : initialConfig?.window || 3;
  });
  const [maxStates, setMaxStates] = useState<number>(() => {
    const savedMaxStates = localStorage.getItem("screener_maxStates");
    return savedMaxStates ? Number(savedMaxStates) : initialConfig?.max_states || 2;
  });
  const [trainWindow, setTrainWindow] = useState<number>(() => {
    const savedTrainWindow = localStorage.getItem("screener_trainWindow");
    return savedTrainWindow ? Number(savedTrainWindow) : initialConfig?.train_window || 252;
  });
  const [useRollingWindow, setUseRollingWindow] = useState<boolean>(() => {
    const savedUseRollingWindow = localStorage.getItem("screener_useRollingWindow");
    return savedUseRollingWindow ? JSON.parse(savedUseRollingWindow) : initialConfig?.use_rolling_window || false;
  });
  const [slippage, setSlippage] = useState<number>(() => {
    const savedSlippage = localStorage.getItem("screener_slippage");
    return savedSlippage ? Number(savedSlippage) : 0.001;
  });
  const [indices, setIndices] = useState<Record<string, Index>>({});
  const [availableFeatures, setAvailableFeatures] = useState<string[]>(() => {
    const savedAvailableFeatures = localStorage.getItem("screener_availableFeatures");
    if (savedAvailableFeatures) return JSON.parse(savedAvailableFeatures);
    if (
      initialConfig?.available_features &&
      Array.isArray(initialConfig.available_features)
    ) {
      return initialConfig.available_features;
    }
    return [
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
    ];
  });

  const [currentTab, setCurrentTab] = useState(0);
  const [filter, setFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("Calmar Ratio");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const filterOpen = Boolean(filterAnchorEl);

  useEffect(() => {
    localStorage.setItem("screener_symbolsInput", symbolsInput);
    localStorage.setItem("screener_inputMethod", inputMethod);
    localStorage.setItem("screener_selectedIndex", selectedIndex);
    localStorage.setItem("screener_exchangeSuffix", exchangeSuffix);
    localStorage.setItem("screener_period", period);
    localStorage.setItem("screener_interval", interval);
    localStorage.setItem("screener_features", JSON.stringify(features));
    localStorage.setItem("screener_windowSize", windowSize.toString());
    localStorage.setItem("screener_maxStates", maxStates.toString());
    localStorage.setItem("screener_trainWindow", trainWindow.toString());
    localStorage.setItem("screener_useRollingWindow", JSON.stringify(useRollingWindow));
    localStorage.setItem("screener_slippage", slippage.toString());
    localStorage.setItem("screener_availableFeatures", JSON.stringify(availableFeatures));
  }, [
    symbolsInput,
    inputMethod,
    selectedIndex,
    exchangeSuffix,
    period,
    interval,
    features,
    windowSize,
    maxStates,
    trainWindow,
    useRollingWindow,
    slippage,
    availableFeatures,
  ]);

  const getAlertVariant = (
    type: "info" | "success" | "warning" | "error" | null
  ): "default" | "destructive" => {
    if (type === "error") return "destructive";
    return "default";
  };

  const columns: Column[] = [
    { id: "Stock", label: "Stock", tooltip: "Stock ticker symbol" },
    {
      id: "Latest Regime",
      label: "Latest Regime",
      tooltip: "Most recent HMM regime",
    },
    {
      id: "Mean Annualized Return (%)",
      label: "Regime Avg Ann Return (%)",
      format: (value) =>
        typeof value === "number" ? value.toFixed(2) : value || "N/A",
      tooltip: "Average annualized return for the regime",
    },
    {
      id: "Recommendation",
      label: "Recommendation",
      tooltip: "Model recommendation",
    },
    {
      id: "Converged",
      label: "Model Converged",
      format: (value) => (value ? "Yes" : "No"),
      tooltip: "Indicates if the HMM model converged",
    },
    {
      id: "Initial Portfolio Value",
      label: "Initial Value",
      format: (value) =>
        typeof value === "number" ? value.toFixed(2) : value || "N/A",
      tooltip: "Starting portfolio value",
    },
    {
      id: "Final Portfolio Value",
      label: "Final Value",
      format: (value) =>
        typeof value === "number" ? value.toFixed(2) : value || "N/A",
      tooltip: "Ending portfolio value after backtest",
    },
    {
      id: "Backtest Return (%)",
      label: "Backtest Return (%)",
      format: (value) =>
        typeof value === "number" ? value.toFixed(2) : value || "N/A",
      tooltip: "Total return from backtest",
    },
    {
      id: "Annualized Backtest Return (%)",
      label: "Ann. Backtest Return (%)",
      format: (value) =>
        typeof value === "number" ? value.toFixed(2) : value || "N/A",
      tooltip: "Annualized return from backtest",
    },
    {
      id: "Max Drawdown (%)",
      label: "Max Drawdown (%)",
      format: (value) =>
        typeof value === "number" ? value.toFixed(2) : value || "N/A",
      tooltip: "Maximum loss from peak to trough",
    },
    {
      id: "Sharpe Ratio",
      label: "Sharpe Ratio",
      format: (value) =>
        typeof value === "number" ? value.toFixed(2) : value || "N/A",
      tooltip: "Risk-adjusted return (return per unit of risk)",
    },
    {
      id: "Sortino Ratio",
      label: "Sortino Ratio",
      format: (value) =>
        typeof value === "number" ? value.toFixed(2) : value || "N/A",
      tooltip: "Risk-adjusted return (return per unit of downside risk)",
    },
    {
      id: "Calmar Ratio",
      label: "Calmar Ratio",
      format: (value) =>
        typeof value === "number" ? value.toFixed(2) : value || "N/A",
      tooltip: "Return per unit of max drawdown",
    },
    {
      id: "Treynor Ratio",
      label: "Treynor Ratio",
      format: (value) =>
        typeof value === "number" ? value.toFixed(2) : value || "N/A",
      tooltip: "Return per unit of market risk (beta)",
    },
    {
      id: "Beta",
      label: "Beta",
      format: (value) =>
        typeof value === "number" ? value.toFixed(4) : value || "N/A",
      tooltip: "Measure of stock volatility relative to the market",
    },
    {
      id: "Number of Trades",
      label: "Num Trades",
      tooltip: "Total number of trades executed",
    },
    {
      id: "Win/Loss Ratio (%)",
      label: "Win/Loss Ratio (%)",
      format: (value) =>
        typeof value === "number" ? `${value.toFixed(2)}%` : value || "N/A",
      tooltip: "Ratio of winning trades to losing trades",
    },
    {
      id: "Avg Holding Period (days)",
      label: "Avg Holding (days)",
      format: (value) =>
        typeof value === "number" ? `${value.toFixed(2)} days` : value || "N/A",
      tooltip: "Average duration of holding a position",
    },
    {
      id: "Benchmark Return (%)",
      label: "Benchmark Return (%)",
      format: (value) =>
        typeof value === "number" ? value.toFixed(2) : value || "N/A",
      tooltip: "Return of the benchmark index",
    },
    {
      id: "Trades Executed",
      label: "Trades Executed",
      format: (value) => (value ? "Yes" : "No"),
      tooltip: "Indicates if trades were executed in the backtest",
    },
    {
      id: "Error",
      label: "Error",
      tooltip: "Any errors encountered during screening",
    },
  ];

  useEffect(() => {
    if (!authLoading && (!user || !isEmailConfirmed)) {
      showStatus(
        "Please log in and confirm your email to access the screener.",
        "warning"
      );
    }
  }, [authLoading, user, isEmailConfirmed, showStatus]);

  useEffect(() => {
    const fetchDataOptions = async () => {
      if (!user || !isEmailConfirmed) return;

      try {
        console.log("Fetching indices and config...");
        const [indicesData, config] = await Promise.all([
          getIndices(),
          getConfig(),
        ]);
        console.log("Indices fetched:", indicesData);
        console.log("Config fetched:", config);
        setIndices(indicesData);

        if (
          config?.available_features &&
          Array.isArray(config.available_features)
        ) {
          setAvailableFeatures(config.available_features);
          setFeatures((currentFeatures) =>
            currentFeatures.filter((f) => config.available_features.includes(f))
          );
        }

        const firstIndexKey = Object.keys(indicesData)[0];
        if (firstIndexKey && !selectedIndex && inputMethod === "Select Index") {
          setSelectedIndex(firstIndexKey);
          setExchangeSuffix(
            indicesData[firstIndexKey].exchange_suffix || ".NS"
          );
        }
      } catch (err: any) {
        console.error("Failed to fetch data options:", err);
        showStatus(
          "Failed to load indices or configuration. Please try again.",
          "error"
        );
      }
    };
    fetchDataOptions();
  }, [
    initialConfig,
    selectedIndex,
    inputMethod,
    showStatus,
    user,
    isEmailConfirmed,
  ]);

  useEffect(() => {
    if (inputMethod === "Select Index" && indices[selectedIndex]) {
      setExchangeSuffix(indices[selectedIndex].exchange_suffix || ".NS");
    }
  }, [selectedIndex, indices, inputMethod]);

  useEffect(() => {
    if (results && results.length > 0 && !selectedStockResult) {
      console.log("[ResultsTable] Auto-selecting first stock:", results[0]);
      selectStock(results[0]);
    }
  }, [results, selectedStockResult, selectStock]);

  const handleRunClick = useCallback(async () => {
    if (!user || !isEmailConfirmed) {
      showStatus("Please log in and confirm your email.", "warning");
      console.log("Auth check failed");
      return;
    }

    let symbolsList: string[] = [];
    try {
      if (inputMethod === "Select Index") {
        if (!selectedIndex || !indices[selectedIndex]) {
          showStatus("Please select a valid index.", "warning");
          console.log("Invalid index selected:", selectedIndex);
          return;
        }
        symbolsList = indices[selectedIndex].symbols || [];
        console.log("Selected index symbols:", symbolsList);
      } else if (inputMethod === "Enter Stocks") {
        symbolsList = symbolsInput
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s);
        console.log("Entered symbols:", symbolsList);
      } else if (inputMethod === "Upload CSV") {
        symbolsList = symbolsInput
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s);
        console.log("CSV symbols:", symbolsList);
      } else {
        showStatus("Invalid input method selected.", "warning");
        console.log("Invalid input method:", inputMethod);
        return;
      }
    } catch (err) {
      console.error("Error processing symbols:", err);
      showStatus(
        "Failed to process symbols. Please check your input.",
        "error"
      );
      return;
    }

    if (!symbolsList || symbolsList.length === 0) {
      showStatus("Please enter or select stocks.", "warning");
      console.log("No symbols provided");
      return;
    }
    if (features.length === 0) {
      showStatus("Please select at least one feature for the HMM.", "warning");
      console.log("No features selected");
      return;
    }

    try {
      console.log("Validating symbols:", symbolsList);
      const validationResult = await validateSymbols(
        symbolsList.map((s) => s.replace(exchangeSuffix, "")),
        exchangeSuffix
      );
      console.log("Validation result:", validationResult);
      if (
        validationResult.invalid_symbols &&
        Object.keys(validationResult.invalid_symbols).length > 0
      ) {
        const invalid = Object.keys(validationResult.invalid_symbols).join(
          ", "
        );
        showStatus(`Invalid symbols: ${invalid}`, "warning");
        console.log("Invalid symbols:", invalid);
        return;
      }
      symbolsList = validationResult.valid_symbols.map(
        (s) => `${s}${exchangeSuffix}`
      );
      console.log("Validated symbols:", symbolsList);
    } catch (err: any) {
      console.error("Symbol validation failed:", err);
      showStatus(
        "Failed to validate symbols. Please check your input.",
        "error"
      );
      return;
    }

    const params: ScreenerParams = {
      symbols: symbolsList,
      period,
      interval,
      feature_sets: [features],
      window: windowSize,
      max_states: maxStates,
      train_window: trainWindow,
      exchange_suffix: exchangeSuffix,
      use_rolling_window: useRollingWindow,
      slippage,
    };

    console.log("Calling runScreener with params:", params);
    try {
      await runScreener(params);
      console.log("Screener run successfully, switching to Results tab");
      setCurrentTab(0); // Switch to Results tab (Results Table)
      showStatus("Screener run successfully. Viewing results.", "success");
    } catch (err: any) {
      console.error("runScreener failed:", err);
      showStatus("Failed to run screener. Please try again.", "error");
    }
  }, [
    runScreener,
    symbolsInput,
    inputMethod,
    selectedIndex,
    indices,
    features,
    period,
    interval,
    windowSize,
    maxStates,
    trainWindow,
    exchangeSuffix,
    useRollingWindow,
    slippage,
    showStatus,
    user,
    isEmailConfirmed,
  ]);

  const handleCsvUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      console.log("Uploading CSV file:", file.name);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<any>) => {
          if (results.errors.length) {
            console.error("CSV parsing errors:", results.errors);
            showStatus(
              `CSV Parsing Errors: ${results.errors
                .map((e) => e.message)
                .join(", ")}`,
              "error"
            );
            return;
          }
          if (!results.data || !Array.isArray(results.data)) {
            console.error("Invalid CSV data");
            showStatus(
              "Invalid CSV format. Please ensure it contains valid data.",
              "error"
            );
            return;
          }
          const symbolsCol = results.data
            .map((row: any) => row["Symbol"])
            .filter((symbol: string) => symbol);
          if (symbolsCol.length === 0) {
            console.error("No valid symbols found in CSV");
            showStatus(
              "CSV must contain a 'Symbol' column with values.",
              "error"
            );
            setSymbolsInput("");
            return;
          }
          console.log("CSV symbols loaded:", symbolsCol);
          setSymbolsInput(symbolsCol.join(", "));
          showStatus(
            `Loaded ${symbolsCol.length} symbols from CSV.`,
            "success"
          );
          setInputMethod("Enter Stocks");
        },
        error: (error: Error) => {
          console.error("CSV parsing error:", error);
          showStatus(`Error reading CSV: ${error.message}`, "error");
        },
      });
    },
    [showStatus]
  );

  const handleSaveConfig = useCallback(async () => {
    const config: Config = {
      period,
      interval,
      features,
      available_features: availableFeatures,
      window: windowSize,
      max_states: maxStates,
      train_window: trainWindow,
      use_rolling_window: useRollingWindow,
      sma_period: initialConfig?.sma_period || 50,
    };
    try {
      console.log("Saving config:", config);
      const response = await saveConfig(config);
      console.log("Save config response:", response);
      showStatus("Configuration saved successfully.", "success");
    } catch (err: any) {
      console.error("Failed to save config:", err);
      showStatus("Failed to save configuration.", "error");
    }
  }, [
    period,
    interval,
    features,
    availableFeatures,
    windowSize,
    maxStates,
    trainWindow,
    useRollingWindow,
    initialConfig,
    showStatus,
  ]);

  const handleClearCache = useCallback(async () => {
    try {
      console.log("Clearing cache...");
      const response = await clearCache();
      console.log("Clear cache response:", response);
      showStatus("Cache cleared successfully.", "success");
    } catch (err: any) {
      console.error("Failed to clear cache:", err);
      showStatus("Failed to clear cache.", "error");
    }
  }, [showStatus]);

  const normalizedResults = (results || []).map((result) => {
    const normalized: { [key: string]: any } = {};
    Object.keys(result).forEach((key) => {
      const normalizedKey =
        columns.find((col) => col.id.toLowerCase() === key.toLowerCase())?.id ||
        key;
      normalized[normalizedKey] = result[key];
    });
    return normalized;
  });

  const filteredResults =
    filter.length === 0
      ? normalizedResults
      : normalizedResults.filter((result) =>
          filter.includes(result.Recommendation)
        );

  const getSortValue = (item: any, key: string) => {
    const value = item[key];
    if (typeof value === "string") {
      if (
        [
          "No Trades",
          "N/A",
          "ERROR",
          "INCONCLUSIVE",
          "ERROR_UNEXPECTED",
        ].includes(value)
      ) {
        return sortDirection === "asc" ? Infinity : -Infinity;
      }
      if (value.endsWith("%")) {
        const num = parseFloat(value);
        return isNaN(num)
          ? sortDirection === "asc"
            ? Infinity
            : -Infinity
          : num;
      }
      return value;
    }
    return value;
  };

  const sortedResults = [...filteredResults].sort((a, b) => {
    const aValue = getSortValue(a, sortBy);
    const bValue = getSortValue(b, sortBy);

    if (aValue === Infinity && bValue === Infinity) return 0;
    if (aValue === Infinity) return 1;
    if (bValue === Infinity) return -1;
    if (aValue === -Infinity && bValue === -Infinity) return 0;
    if (aValue === -Infinity) return -1;
    if (bValue === -Infinity) return 1;

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const csvHeaders = columns.map((col) => ({ label: col.label, key: col.id }));
  const csvData = filteredResults.map((row) => {
    const rowData: { [key: string]: any } = {};
    columns.forEach((col) => {
      const value = row[col.id];
      rowData[col.id] = col.format
        ? col.format(value)
        : typeof value === "boolean"
        ? value
          ? "Yes"
          : "No"
        : value || "N/A";
    });
    return rowData;
  });

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const handleRequestSort = (property: string) => {
    const isAsc = sortBy === property && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortBy(property);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const toggleFilter = (rec: string) => {
    setFilter((prev) =>
      prev.includes(rec) ? prev.filter((r) => r !== rec) : [...prev, rec]
    );
  };

  const handleStockSelect = (stockResult: any) => {
    console.log("[ResultsTable] Selecting stock:", stockResult);
    selectStock(stockResult);
    setCurrentTab(1);
  };

  const allRecommendations = Array.from(
    new Set(
      normalizedResults.map((result) => result.Recommendation).filter(Boolean)
    )
  );

  const showPeriodWarning =
    period !== "max" && periodDays[period] < trainWindow;
  const showSmaPeriodWarning =
    period !== "max" &&
    periodDays[period] < (initialConfig?.sma_period || 50) &&
    interval === "1d";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2 md:w-1/2 mx-auto">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        <TabsContent value="configuration">
          <Card className="border-gray-100 shadow-md max-w-4xl mx-auto">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Advanced Stock Screener
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Discover market opportunities with our Hidden Markov Model-powered
                screener. Customize your analysis with precision and ease.
              </p>

              {(statusMessage || error) && (
                <Alert
                  variant={getAlertVariant(
                    statusMessageType || (error ? "error" : null)
                  )}
                  className="mb-6"
                >
                  {statusMessageType === "info" && <Info className="h-4 w-4" />}
                  {statusMessageType === "success" && (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {statusMessageType === "warning" && (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  {(statusMessageType === "error" || error) && (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{error || statusMessage}</AlertDescription>
                </Alert>
              )}

              <div className="mb-6 border rounded-lg p-6 bg-gray-50">
                <h3 className="font-semibold text-lg mb-4 text-gray-800">Data Input</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Input Method
                    </Label>
                    <Select value={inputMethod} onValueChange={setInputMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Input Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Select Index">Select Index</SelectItem>
                        <SelectItem value="Upload CSV">Upload CSV</SelectItem>
                        <SelectItem value="Enter Stocks">Enter Stocks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    {inputMethod === "Select Index" && (
                      <>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Index
                        </Label>
                        <Select
                          value={selectedIndex}
                          onValueChange={setSelectedIndex}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Index" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(indices).map((key) => (
                              <SelectItem key={key} value={key}>
                                {key}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                    {inputMethod === "Upload CSV" && (
                      <>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload CSV
                        </Label>
                        <Button variant="outline" asChild className="w-full">
                          <label>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload CSV
                            <input
                              type="file"
                              accept=".csv"
                              onChange={handleCsvUpload}
                              className="hidden"
                            />
                          </label>
                        </Button>
                      </>
                    )}
                    {inputMethod === "Enter Stocks" && (
                      <>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter Stock Symbols
                        </Label>
                        <Input
                          value={symbolsInput}
                          onChange={(e) => setSymbolsInput(e.target.value)}
                          placeholder="e.g., RELIANCE.NS, TCS.NS, SBIN.NS"
                          className="h-20"
                        />
                      </>
                    )}
                  </div>

                  {(inputMethod === "Upload CSV" ||
                    inputMethod === "Enter Stocks") && (
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Exchange Suffix
                      </Label>
                      <Input
                        value={exchangeSuffix}
                        onChange={(e) => setExchangeSuffix(e.target.value)}
                        placeholder=".NS"
                      />
                    </div>
                  )}

                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Period
                    </Label>
                    <Select value={period} onValueChange={setPeriod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1y">1 Year</SelectItem>
                        <SelectItem value="2y">2 Years</SelectItem>
                        <SelectItem value="5y">5 Years</SelectItem>
                        <SelectItem value="max">Max Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Interval
                    </Label>
                    <Select value={interval} onValueChange={setInterval}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1d">1 Day</SelectItem>
                        <SelectItem value="1wk">1 Week</SelectItem>
                        <SelectItem value="1mo">1 Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Model Parameters Section */}
                <div className="border rounded-2xl p-8 bg-white shadow-lg">
                  <h3 className="font-bold text-xl text-gray-900 mb-6">
                    Model Configuration
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* HMM Features Section */}
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-800">
                        HMM Features
                      </label>
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        {availableFeatures.map((feat) => (
                          <div
                            key={feat}
                            className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-150"
                          >
                            <Checkbox
                              id={feat}
                              checked={features.includes(feat)}
                              onCheckedChange={(checked) => {
                                if (checked) setFeatures([...features, feat]);
                                else
                                  setFeatures(features.filter((f) => f !== feat));
                              }}
                              className="h-5 w-5 text-blue-600"
                            />
                            <label
                              htmlFor={feat}
                              className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                            >
                              {feat}
                            </label>
                          </div>
                        ))}
                        {features.length === 0 && (
                          <p className="text-sm text-red-600 flex items-center mt-3 animate-pulse">
                            <AlertTriangle className="h-4 w-4 mr-2" /> Please
                            select at least one feature.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800">
                          Feature Window Size:{" "}
                          <span className="text-blue-600">{windowSize}</span>
                        </label>
                        <Slider
                          value={[windowSize]}
                          onValueChange={(value) => setWindowSize(value[0])}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* Max HMM States */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800">
                          Max HMM States:{" "}
                          <span className="text-blue-600">{maxStates}</span>
                        </label>
                        <Slider
                          value={[maxStates]}
                          onValueChange={(value) => setMaxStates(value[0])}
                          min={2}
                          max={5}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* Training Window */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800">
                          Training Window (days):{" "}
                          <span className="text-blue-600">{trainWindow}</span>
                        </label>
                        <Slider
                          value={[trainWindow]}
                          onValueChange={(value) => setTrainWindow(value[0])}
                          min={60}
                          max={756}
                          step={10}
                          className="w-full"
                        />
                      </div>

                      {/* Rolling Window Switch */}
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={useRollingWindow}
                          onCheckedChange={setUseRollingWindow}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Use Recent Training Window
                        </label>
                      </div>

                      {/* Warnings */}
                      {showPeriodWarning && (
                        <p className="text-sm text-yellow-600 flex items-center mt-3 animate-pulse">
                          <AlertTriangle className="h-4 w-4 mr-2" /> Warning:
                          Training window exceeds data period.
                        </p>
                      )}
                      {showSmaPeriodWarning && (
                        <p className="text-sm text-yellow-600 flex items-center mt-3 animate-pulse">
                          <AlertTriangle className="h-4 w-4 mr-2" /> Warning: Data
                          period too short for SMA.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border rounded-xl p-6 bg-white shadow-sm">
                  <h3 className="font-semibold text-lg text-gray-800 mb-4">
                    Backtest Settings
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slippage (%):{" "}
                      <span className="font-semibold">{slippage.toFixed(3)}</span>
                    </label>
                    <Slider
                      value={[slippage]}
                      onValueChange={(value) => setSlippage(value[0])}
                      min={0.0}
                      max={0.1}
                      step={0.001}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Adjust slippage to account for transaction costs.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  <Button
                    onClick={handleRunClick}
                    disabled={
                      isLoading ||
                      features.length === 0 ||
                      !user ||
                      !isEmailConfirmed ||
                      Object.keys(indices).length === 0
                    }
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Running Screener...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4" /> Run Screener
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSaveConfig}
                    disabled={isLoading}
                    variant="outline"
                    className="gap-2"
                  >
                    Save Configuration
                  </Button>
                  <Button
                    onClick={handleClearCache}
                    disabled={isLoading}
                    variant="outline"
                    className="gap-2"
                  >
                    Clear Cache
                  </Button>
                </div>
              </div>
              {isLoading && (
                <div className="mt-6 text-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full animate-pulse"
                      style={{ width: "60%" }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Analyzing stocks... This may take a moment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="results">
          <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
            <Typography variant="h5" gutterBottom>
              Screening Results
            </Typography>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Partial Screening Error: {error}
                </AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "70vh",
                }}
              >
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ ml: 2 }}>
                  Loading Results...
                </Typography>
              </Box>
            )}

            {!isLoading && (!results || results.length === 0) && !error && (
              <Alert variant="default" className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No results available. Please adjust the screener inputs and try
                  again.
                </AlertDescription>
              </Alert>
            )}

            {/* Results */}
            {results && results.length > 0 && (
              <>
                {/* Header with Filter and CSV Download */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFilterClick}
                      className="gap-2"
                    >
                      <FilterListIcon fontSize="small" />
                      Filter Recommendation
                    </Button>
                    <Menu
                      anchorEl={filterAnchorEl}
                      open={filterOpen}
                      onClose={handleFilterClose}
                    >
                      {allRecommendations.length > 0 ? (
                        allRecommendations.map((rec) => (
                          <MenuItem
                            key={rec}
                            onClick={() => toggleFilter(rec)}
                            disableRipple
                          >
                            {rec} (
                            {
                              normalizedResults.filter(
                                (r) => r.Recommendation === rec
                              ).length
                            }
                            )
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No recommendations available</MenuItem>
                      )}
                    </Menu>
                  </Box>
                  <CSVLink
                    data={csvData}
                    headers={csvHeaders}
                    filename="stock_screener_results.csv"
                    style={{ textDecoration: "none" }}
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <DownloadIcon fontSize="small" />
                      Download CSV
                    </Button>
                  </CSVLink>
                </Box>

                {/* Tabs */}
                <Paper elevation={1} sx={{ mb: 3 }}>
                  <MuiTabs
                    value={currentTab}
                    onChange={(e, newValue) => setCurrentTab(newValue)}
                    aria-label="results tabs"
                  >
                    <Tab label={`Results Table (${filteredResults.length})`} />
                    <Tab
                      label={`Stock Details${
                        selectedStockResult
                          ? `: ${
                              selectedStockResult.Stock ||
                              selectedStockResult.stock
                            }`
                          : ""
                      }`}
                      disabled={!selectedStockResult}
                    />
                  </MuiTabs>
                </Paper>

                {/* Results Table Tab */}
                {currentTab === 0 && (
                  <TableContainer
                    component={Paper}
                    sx={{ maxHeight: '100%' , overflowY: "auto" }}
                  >
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          {columns.map((column) => (
                            <TableCell
                              key={column.id}
                              sx={{
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                cursor: "pointer",
                                bgcolor: "#f5f5f5",
                              }}
                              onClick={() => handleRequestSort(column.id)}
                            >
                              <Tooltip title={column.tooltip}>
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  {column.label}
                                  {sortBy === column.id && (
                                    <span>
                                      {sortDirection === "asc" ? (
                                        <ArrowUpwardIcon fontSize="small" />
                                      ) : (
                                        <ArrowDownwardIcon fontSize="small" />
                                      )}
                                    </span>
                                  )}
                                </Box>
                              </Tooltip>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <AnimatePresence>
                          {sortedResults.map((row, index) => (
                            <MotionTableRow
                              key={row.Stock || row.stock}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={rowVariants}
                              hover
                              onClick={() => handleStockSelect(row)}
                              selected={
                                (selectedStockResult?.Stock ||
                                  selectedStockResult?.stock) ===
                                (row.Stock || row.stock)
                              }
                              sx={{
                                cursor: "pointer",
                                bgcolor: index % 2 === 0 ? "white" : "#fafafa",
                                "&.Mui-selected": { bgcolor: "#ffe0b2" },
                                "&:hover": { bgcolor: "#fff3e0" },
                              }}
                            >
                              {columns.map((column) => (
                                <TableCell
                                  key={column.id}
                                  sx={{
                                    fontSize: "0.75rem",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {column.id === "Recommendation" ? (
                                    <Chip
                                      label={
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          {(row.Recommendation === "BUY" ||
                                            row.Recommendation ===
                                              "STRONG BUY") && (
                                            <ArrowUpwardIcon
                                              fontSize="small"
                                              sx={{ mr: 0.5 }}
                                            />
                                          )}
                                          {row.Recommendation === "SELL" && (
                                            <ArrowDownwardIcon
                                              fontSize="small"
                                              sx={{ mr: 0.5 }}
                                            />
                                          )}
                                          {row.Recommendation || "N/A"}
                                        </Box>
                                      }
                                      size="small"
                                      color={
                                        row.Recommendation === "STRONG BUY" ||
                                        row.Recommendation === "BUY"
                                          ? "success"
                                          : row.Recommendation === "SELL" ||
                                            row.Recommendation === "ERROR" ||
                                            row.Recommendation ===
                                              "ERROR_UNEXPECTED"
                                          ? "error"
                                          : row.Recommendation === "HOLD"
                                          ? "warning"
                                          : "default"
                                      }
                                      sx={{
                                        minWidth: 80,
                                        justifyContent: "center",
                                      }}
                                    />
                                  ) : column.format ? (
                                    column.format(row[column.id])
                                  ) : (
                                    row[column.id] || "N/A"
                                  )}
                                </TableCell>
                              ))}
                            </MotionTableRow>
                          ))}
                          {sortedResults.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={columns.length}
                                sx={{ textAlign: "center", py: 4, color: "#666" }}
                              >
                                {filter.length > 0
                                  ? "No stocks match the selected recommendation filters."
                                  : "No results to display. Please check the screener input or try again."}
                              </TableCell>
                            </TableRow>
                          )}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Stock Details Tab */}
                {currentTab === 1 && selectedStockResult && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {selectedStockResult.Stock || selectedStockResult.stock}{" "}
                      Details
                    </Typography>

                    {/* Stock-specific error */}
                    {selectedStockResult.Error && (
                      <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Error for{" "}
                          {selectedStockResult.Stock || selectedStockResult.stock}
                          : {selectedStockResult.Error}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Stock Chart */}
                    {selectedStockResult.Data ? (
                      <StockChartMui
                        selectedStockResult={selectedStockResult}
                        showPriceMA={true}
                        showVolumeMA={true}
                      />
                    ) : (
                      <Alert variant="default" className="mb-6">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          No chart data available for{" "}
                          {selectedStockResult.Stock || selectedStockResult.stock}
                          .
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Backtest Metrics */}
                    {selectedStockResult.TradesExecuted ? (
                      <BacktestMetricsMui backtestMetrics={selectedStockResult} />
                    ) : selectedStockResult.Converged &&
                      !selectedStockResult.TradesExecuted ? (
                      <Alert variant="default" className="mb-6">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          No trades executed for{" "}
                          {selectedStockResult.Stock || selectedStockResult.stock}{" "}
                          during backtest.
                        </AlertDescription>
                      </Alert>
                    ) : !selectedStockResult.Converged &&
                      !selectedStockResult.Error ? (
                      <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Cannot show backtest metrics for{" "}
                          {selectedStockResult.Stock || selectedStockResult.stock}
                          : Model did not converge.
                        </AlertDescription>
                      </Alert>
                    ) : null}
                  </Box>
                )}

                {/* No filtered results message */}
                {filteredResults.length === 0 &&
                  filter.length > 0 &&
                  currentTab === 0 && (
                    <Box sx={{ textAlign: "center", mt: 4 }}>
                      <Typography color="textSecondary">
                        No stocks match the selected recommendation filters.
                      </Typography>
                    </Box>
                  )}
              </>
            )}
          </Box>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UtBotScreener;