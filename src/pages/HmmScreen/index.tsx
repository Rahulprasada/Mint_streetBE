"use client";

import { useState, useCallback } from "react";
import { runScreenerAPI, ScreenerResult } from "../../context/api"; // Import our API service and types

// shadcn/ui Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

// MUI Components for Results Table
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";

// Lucide Icons
import { PlayCircle, AlertCircle } from "lucide-react";

const HMMScreener = () => {
  // --- State Management ---
  const [symbolsInput, setSymbolsInput] = useState<string>(
    "RELIANCE, TCS, INFY, HDFCBANK"
  );
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Runs the HMM screener by calling the Django backend API.
   */
  const handleRunScreener = useCallback(async () => {
    if (!symbolsInput.trim()) {
      setError("Please enter at least one stock symbol.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const inputSymbols = symbolsInput
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      // Call the real API
      const apiResults = await runScreenerAPI({ symbols: inputSymbols });

      setResults(apiResults);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [symbolsInput]);

  const getChipColor = (recommendation?: ScreenerResult["Recommendation"]) => {
    if (!recommendation) return "default";
    if (recommendation.includes("BUY")) return "success";
    if (recommendation.includes("SELL") || recommendation.includes("ERROR"))
      return "error";
    if (recommendation.includes("HOLD")) return "warning";
    return "default";
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1200px", margin: "auto" }}>
      <Card>
        <CardHeader>
          <CardTitle>HMM Stock Screener</CardTitle>
          <CardDescription>
            Enter comma-separated stock symbols to run analysis via the Django
            backend.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symbols">Stock Symbols (e.g., RELIANCE, TCS)</Label>
            <Input
              id="symbols"
              value={symbolsInput}
              onChange={(e) => setSymbolsInput(e.target.value)}
              placeholder="Enter symbols..."
              disabled={isLoading}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleRunScreener}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} color="inherit" />
                Analyzing...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                Run Analysis
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* --- Results Section --- */}
      {(results.length > 0 || isLoading) && (
        <Paper elevation={3} sx={{ mt: 4 }}>
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" gutterBottom mb={0}>
              Analysis Results
            </Typography>
            {isLoading && <CircularProgress size={24} />}
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                  <TableCell>Stock</TableCell>
                  <TableCell>Latest Regime</TableCell>
                  <TableCell>Recommendation</TableCell>
                  <TableCell align="right">Calmar Ratio</TableCell>
                  <TableCell align="right">Max Drawdown (%)</TableCell>
                  <TableCell>Converged</TableCell>
                  <TableCell>Error</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((row) => (
                  <TableRow
                    key={row.Stock}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>{row.Stock}</TableCell>
                    <TableCell>{row["Latest Regime"] || "N/A"}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.Recommendation || "N/A"}
                        color={getChipColor(row.Recommendation)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {row["Calmar Ratio"]?.toFixed(2) || "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      {row["Max Drawdown (%)"]?.toFixed(2) || "N/A"}%
                    </TableCell>
                    <TableCell>{row.Converged ? "Yes" : "No"}</TableCell>
                    <TableCell
                      sx={{
                        color: "error.main",
                        maxWidth: "200px",
                        whiteSpace: "normal",
                      }}
                    >
                      {row.Error || "None"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default HMMScreener;
