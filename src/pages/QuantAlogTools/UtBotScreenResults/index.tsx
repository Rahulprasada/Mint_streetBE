import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { motion, AnimatePresence } from 'framer-motion';
import { useScreener } from '../../../context/ScreenerContext';
import { useAuth } from '../../../context/AuthContext';

// MUI Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';

// MUI Icons
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const StockChartMui: React.FC<{
  selectedStockResult: any;
  showPriceMA: boolean;
  showVolumeMA: boolean;
}> = ({ selectedStockResult, showPriceMA, showVolumeMA }) => (
  <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
    <Typography variant="body1">
      Chart for {selectedStockResult.Stock || selectedStockResult.stock} (Price MA: {showPriceMA.toString()}, Volume MA: {showVolumeMA.toString()})
    </Typography>
  </Box>
);

const BacktestMetricsMui: React.FC<{ backtestMetrics: any }> = ({ backtestMetrics }) => (
  <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
    <Typography variant="body1">
      Backtest Metrics for {backtestMetrics.Stock || backtestMetrics.stock}
    </Typography>
  </Box>
);

interface Column {
  id: string;
  label: string;
  tooltip: string;
  format?: (value: any) => string;
}

const MotionTableRow = motion(TableRow);

const ResultsTable: React.FC = () => {
  const { results, isLoading, error, selectedStockResult, selectStock } = useScreener();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState(0);
  const [filter, setFilter] = useState<string[]>([]); // Remove default filter
  const [sortBy, setSortBy] = useState<string>('Calmar Ratio');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const filterOpen = Boolean(filterAnchorEl);

  // Log results for debugging
  useEffect(() => {
    console.log("[ResultsTable] Results:", results);
    console.log("[ResultsTable] isLoading:", isLoading, "authLoading:", authLoading, "user:", user, "error:", error);
  }, [results, isLoading, authLoading, user, error]);

  // Auto-select first stock
  useEffect(() => {
    if (results && results.length > 0 && !selectedStockResult) {
      console.log("[ResultsTable] Auto-selecting first stock:", results[0]);
      selectStock(results[0]);
    }
  }, [results, selectedStockResult, selectStock]);

  // Redirect only after confirming no results
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading && !authLoading && user && (!results || results.length === 0) && !error) {
        console.log("[ResultsTable] No results, redirecting to /dashboard/ut-bot-screener");
        navigate('/dashboard/ut-bot-screener');
      }
    }, 1000); // Delay to allow results to load
    return () => clearTimeout(timer);
  }, [isLoading, authLoading, user, results, error, navigate]);

  // Static columns to avoid filtering issues
  const columns: Column[] = [
    { id: 'Stock', label: 'Stock', tooltip: 'Stock ticker symbol' },
    { id: 'Latest Regime', label: 'Latest Regime', tooltip: 'Most recent HMM regime' },
    {
      id: 'Mean Annualized Return (%)',
      label: 'Regime Avg Ann Return (%)',
      format: (value) => (typeof value === 'number' ? value.toFixed(2) : value || 'N/A'),
      tooltip: 'Average annualized return for the regime',
    },
    { id: 'Recommendation', label: 'Recommendation', tooltip: 'Model recommendation' },
    {
      id: 'Converged',
      label: 'Model Converged',
      format: (value) => (value ? 'Yes' : 'No'),
      tooltip: 'Indicates if the HMM model converged',
    },
    {
      id: 'Initial Portfolio Value',
      label: 'Initial Value',
      format: (value) => (typeof value === 'number' ? value.toFixed(2) : value || 'N/A'),
      tooltip: 'Starting portfolio value',
    },
    {
      id: 'Final Portfolio Value',
      label: 'Final Value',
      format: (value) => (typeof value === 'number' ? value.toFixed(2) : value || 'N/A'),
      tooltip: 'Ending portfolio value after backtest',
    },
    {
      id: 'Backtest Return (%)',
      label: 'Backtest Return (%)',
      format: (value) => (typeof value === 'number' ? value.toFixed(2) : value || 'N/A'),
      tooltip: 'Total return from backtest',
    },
    {
      id: 'Annualized Backtest Return (%)',
      label: 'Ann. Backtest Return (%)',
      format: (value) => (typeof value === 'number' ? value.toFixed(2) : value || 'N/A'),
      tooltip: 'Annualized return from backtest',
    },
    {
      id: 'Max Drawdown (%)',
      label: 'Max Drawdown (%)',
      format: (value) => (typeof value === 'number' ? value.toFixed(2) : value || 'N/A'),
      tooltip: 'Maximum loss from peak to trough',
    },
    {
      id: 'Sharpe Ratio',
      label: 'Sharpe Ratio',
      format: (value) => (typeof value === 'number' ? value.toFixed(2) : value || 'N/A'),
      tooltip: 'Risk-adjusted return (return per unit of risk)',
    },
    {
      id: 'Sortino Ratio',
      label: 'Sortino Ratio',
      format: (value) => (typeof value === 'number' ? value.toFixed(2) : value || 'N/A'),
      tooltip: 'Risk-adjusted return (return per unit of downside risk)',
    },
    {
      id: 'Calmar Ratio',
      label: 'Calmar Ratio',
      format: (value) => (typeof value === 'number' ? value.toFixed(2) : value || 'N/A'),
      tooltip: 'Return per unit of max drawdown',
    },
    {
      id: 'Treynor Ratio',
      label: 'Treynor Ratio',
      format: (value) => (typeof value === 'number' ? value.toFixed(2) : value || 'N/A'),
      tooltip: 'Return per unit of market risk (beta)',
    },
    {
      id: 'Beta',
      label: 'Beta',
      format: (value) => (typeof value === 'number' ? value.toFixed(4) : value || 'N/A'),
      tooltip: 'Measure of stock volatility relative to the market',
    },
    {
      id: 'Number of Trades',
      label: 'Num Trades',
      tooltip: 'Total number of trades executed',
    },
    {
      id: 'Win/Loss Ratio (%)',
      label: 'Win/Loss Ratio (%)',
      format: (value) => (typeof value === 'number' ? `${value.toFixed(2)}%` : value || 'N/A'),
      tooltip: 'Ratio of winning trades to losing trades',
    },
    {
      id: 'Avg Holding Period (days)',
      label: 'Avg Holding (days)',
      format: (value) => (typeof value === 'number' ? `${value.toFixed(2)} days` : value || 'N/A'),
      tooltip: 'Average duration of holding a position',
    },
    {
      id: 'Benchmark Return (%)',
      label: 'Benchmark Return (%)',
      format: (value) => (typeof value === 'number' ? value.toFixed(2) : value || 'N/A'),
      tooltip: 'Return of the benchmark index',
    },
    {
      id: 'Trades Executed',
      label: 'Trades Executed',
      format: (value) => (value ? 'Yes' : 'No'),
      tooltip: 'Indicates if trades were executed in the backtest',
    },
    { id: 'Error', label: 'Error', tooltip: 'Any errors encountered during screening' },
  ];

  // Normalize results to handle case sensitivity
  const normalizedResults = (results || []).map((result) => {
    const normalized: { [key: string]: any } = {};
    Object.keys(result).forEach((key) => {
      const normalizedKey = columns.find((col) => col.id.toLowerCase() === key.toLowerCase())?.id || key;
      normalized[normalizedKey] = result[key];
    });
    return normalized;
  });

  // Filter results
  const filteredResults = filter.length === 0
    ? normalizedResults
    : normalizedResults.filter((result) => filter.includes(result.Recommendation));

  console.log("[ResultsTable] Filtered Results:", filteredResults);

  // Sorting logic
  const getSortValue = (item: any, key: string) => {
    const value = item[key];
    if (typeof value === 'string') {
      if (['No Trades', 'N/A', 'ERROR', 'INCONCLUSIVE', 'ERROR_UNEXPECTED'].includes(value)) {
        return sortDirection === 'asc' ? Infinity : -Infinity;
      }
      if (value.endsWith('%')) {
        const num = parseFloat(value);
        return isNaN(num) ? (sortDirection === 'asc' ? Infinity : -Infinity) : num;
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

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // CSV data
  const csvHeaders = columns.map((col) => ({ label: col.label, key: col.id }));
  const csvData = filteredResults.map((row) => {
    const rowData: { [key: string]: any } = {};
    columns.forEach((col) => {
      const value = row[col.id];
      rowData[col.id] = col.format
        ? col.format(value)
        : typeof value === 'boolean'
        ? value
          ? 'Yes'
          : 'No'
        : value || 'N/A';
    });
    return rowData;
  });

  // Animation variants
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  // Handlers
  const handleRequestSort = (property: string) => {
    const isAsc = sortBy === property && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const toggleFilter = (rec: string) => {
    setFilter((prev) => (prev.includes(rec) ? prev.filter((r) => r !== rec) : [...prev, rec]));
  };

  const handleStockSelect = (stockResult: any) => {
    console.log("[ResultsTable] Selecting stock:", stockResult);
    selectStock(stockResult);
    setCurrentTab(1);
  };

  // Get unique recommendations for filter menu
  const allRecommendations = Array.from(
    new Set(normalizedResults.map((result) => result.Recommendation).filter(Boolean))
  );

  // Loading state
  if (isLoading || authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Results...</Typography>
      </Box>
    );
  }

  // Error state
  if (error && (!results || results.length === 0)) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Screening Error: {error}
      </Alert>
    );
  }

  // No results state
  if (!isLoading && !authLoading && user && (!results || results.length === 0) && !error) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No results available. Please run the screener from the Input page.
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate('/dashboard/ut-bot-screener')}
          sx={{ ml: 2 }}
        >
          Go to Screener
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Screening Results
      </Typography>

      {/* Partial error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Partial Screening Error: {error}
        </Alert>
      )}

      {/* Header with Filter and CSV Download */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterListIcon />}
            onClick={handleFilterClick}
            sx={{ textTransform: 'none' }}
          >
            Filter Recommendation
          </Button>
          <Menu anchorEl={filterAnchorEl} open={filterOpen} onClose={handleFilterClose}>
            {allRecommendations.length > 0 ? (
              allRecommendations.map((rec) => (
                <MenuItem key={rec} onClick={() => toggleFilter(rec)} disableRipple>
                  <Checkbox checked={filter.includes(rec)} size="small" />
                  {rec} ({normalizedResults.filter((r) => r.Recommendation === rec).length})
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
          style={{ textDecoration: 'none' }}
        >
          <Button variant="outlined" size="small" startIcon={<DownloadIcon />} sx={{ textTransform: 'none' }}>
            Download CSV
          </Button>
        </CSVLink>
      </Box>

      {/* Tabs */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} aria-label="results tabs">
          <Tab label={`Results Table (${filteredResults.length})`} />
          <Tab
            label={`Stock Details${selectedStockResult ? `: ${selectedStockResult.Stock || selectedStockResult.stock}` : ''}`}
            disabled={!selectedStockResult}
          />
        </Tabs>
      </Paper>

      {/* Results Table Tab */}
      {currentTab === 0 && (
        <TableContainer component={Paper} sx={{ maxHeight: 350, overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    sx={{ fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', bgcolor: '#f5f5f5' }}
                    onClick={() => handleRequestSort(column.id)}
                  >
                    <Tooltip title={column.tooltip}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {column.label}
                        {sortBy === column.id && (
                          <span>
                            {sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
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
                    selected={(selectedStockResult?.Stock || selectedStockResult?.stock) === (row.Stock || row.stock)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: index % 2 === 0 ? 'white' : '#fafafa',
                      '&.Mui-selected': { bgcolor: '#ffe0b2' },
                      '&:hover': { bgcolor: '#fff3e0' },
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.id} sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {column.id === 'Recommendation' ? (
                          <Chip
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {(row.Recommendation === 'BUY' || row.Recommendation === 'STRONG BUY') && (
                                  <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                                )}
                                {row.Recommendation === 'SELL' && <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5 }} />}
                                {row.Recommendation || 'N/A'}
                              </Box>
                            }
                            size="small"
                            color={
                              row.Recommendation === 'STRONG BUY' || row.Recommendation === 'BUY'
                                ? 'success'
                                : row.Recommendation === 'SELL' ||
                                  row.Recommendation === 'ERROR' ||
                                  row.Recommendation === 'ERROR_UNEXPECTED'
                                ? 'error'
                                : row.Recommendation === 'HOLD'
                                ? 'warning'
                                : 'default'
                            }
                            sx={{ minWidth: 80, justifyContent: 'center' }}
                          />
                        ) : column.format ? (
                          column.format(row[column.id])
                        ) : (
                          row[column.id] || 'N/A'
                        )}
                      </TableCell>
                    ))}
                  </MotionTableRow>
                ))}
                {sortedResults.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columns.length} sx={{ textAlign: 'center', py: 4, color: '#666' }}>
                      {filter.length > 0
                        ? 'No stocks match the selected recommendation filters.'
                        : 'No results to display. Please check the screener input or try again.'}
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
            {selectedStockResult.Stock || selectedStockResult.stock} Details
          </Typography>

          {/* Stock-specific error */}
          {selectedStockResult.Error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Error for {selectedStockResult.Stock || selectedStockResult.stock}: {selectedStockResult.Error}
            </Alert>
          )}

          {/* Stock Chart */}
          {selectedStockResult.Data ? (
            <StockChartMui selectedStockResult={selectedStockResult} showPriceMA={true} showVolumeMA={true} />
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              No chart data available for {selectedStockResult.Stock || selectedStockResult.stock}.
            </Alert>
          )}

          {/* Backtest Metrics */}
          {selectedStockResult.TradesExecuted ? (
            <BacktestMetricsMui backtestMetrics={selectedStockResult} />
          ) : selectedStockResult.Converged && !selectedStockResult.TradesExecuted ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No trades executed for {selectedStockResult.Stock || selectedStockResult.stock} during backtest.
            </Alert>
          ) : !selectedStockResult.Converged && !selectedStockResult.Error ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Cannot show backtest metrics for {selectedStockResult.Stock || selectedStockResult.stock}: Model did not converge.
            </Alert>
          ) : null}
        </Box>
      )}

      {/* No filtered results message */}
      {filteredResults.length === 0 && filter.length > 0 && currentTab === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="textSecondary">
            No stocks match the selected recommendation filters.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/dashboard/ut-bot-screener')}
            sx={{ mt: 2 }}
          >
            Back to Screener
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ResultsTable;
