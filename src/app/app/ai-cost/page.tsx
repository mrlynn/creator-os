'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TokenIcon from '@mui/icons-material/Token';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import CategoryIcon from '@mui/icons-material/Category';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface UsageSummary {
  totalTokens: number;
  estimatedCost: number;
  totalRequests: number;
  successRate: number;
}

interface CategorySummary {
  category: string;
  tokens: number;
  requests: number;
  estimatedCost: number;
  successRate: number;
  avgDurationMs: number;
}

interface ModelSummary {
  model: string;
  provider: string;
  tokens: number;
  requests: number;
  estimatedCost: number;
}

interface DailyUsage {
  date: string;
  tokens: number;
  estimatedCost: number;
  requests: number;
}

interface RecentLog {
  _id: string;
  category: string;
  aiModel: string;
  provider?: string;
  tokensUsed: number;
  costEstimate?: number;
  durationMs: number;
  success: boolean;
  createdAt?: string;
}

export default function AiCostPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [byCategory, setByCategory] = useState<CategorySummary[]>([]);
  const [byModel, setByModel] = useState<ModelSummary[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/ai-usage-logs?days=${days}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || err.message || 'Failed to load');
        }
        const data = await res.json();
        setSummary(data.summary);
        setByCategory(data.byCategory || []);
        setByModel(data.byModel || []);
        setDailyUsage(data.dailyUsage || []);
        setRecentLogs(data.recentLogs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load usage data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [days]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RequestQuoteIcon />
          AI Cost Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            select
            size="small"
            label="Period"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value, 10))}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={14}>Last 14 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={90}>Last 90 days</MenuItem>
          </TextField>
        </Stack>

        {summary && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <RequestQuoteIcon color="primary" />
                    <Typography color="text.secondary" variant="body2">
                      Estimated Cost
                    </Typography>
                  </Stack>
                  <Typography variant="h4" component="div">
                    ${summary.estimatedCost.toFixed(4)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <TokenIcon color="primary" />
                    <Typography color="text.secondary" variant="body2">
                      Total Tokens
                    </Typography>
                  </Stack>
                  <Typography variant="h4" component="div">
                    {summary.totalTokens.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <TrendingUpIcon color="primary" />
                    <Typography color="text.secondary" variant="body2">
                      Requests
                    </Typography>
                  </Stack>
                  <Typography variant="h4" component="div">
                    {summary.totalRequests.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <CategoryIcon color="primary" />
                    <Typography color="text.secondary" variant="body2">
                      Success Rate
                    </Typography>
                  </Stack>
                  <Typography variant="h4" component="div">
                    {summary.successRate}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {dailyUsage.length > 0 && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Daily Usage (Last 14 days)
            </Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value: number, name: string) =>
                      name === 'estimatedCost' ? `$${value.toFixed(4)}` : value.toLocaleString()
                    }
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="tokens"
                    name="Tokens"
                    stroke="#1976d2"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="estimatedCost"
                    name="Cost ($)"
                    stroke="#2e7d32"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                By Category
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Tokens</TableCell>
                      <TableCell align="right">Requests</TableCell>
                      <TableCell align="right">Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {byCategory.map((c) => (
                      <TableRow key={c.category}>
                        <TableCell>{c.category}</TableCell>
                        <TableCell align="right">{c.tokens.toLocaleString()}</TableCell>
                        <TableCell align="right">{c.requests}</TableCell>
                        <TableCell align="right">${c.estimatedCost.toFixed(4)}</TableCell>
                      </TableRow>
                    ))}
                    {byCategory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" color="text.secondary">
                          No usage data
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                By Model
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Model</TableCell>
                      <TableCell>Provider</TableCell>
                      <TableCell align="right">Tokens</TableCell>
                      <TableCell align="right">Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {byModel.map((m) => (
                      <TableRow key={`${m.provider}-${m.model}`}>
                        <TableCell>{m.model}</TableCell>
                        <TableCell>{m.provider}</TableCell>
                        <TableCell align="right">{m.tokens.toLocaleString()}</TableCell>
                        <TableCell align="right">${m.estimatedCost.toFixed(4)}</TableCell>
                      </TableRow>
                    ))}
                    {byModel.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" color="text.secondary">
                          No usage data
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        {recentLogs.length > 0 && (
          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell align="right">Tokens</TableCell>
                    <TableCell align="right">Cost</TableCell>
                    <TableCell align="right">Duration</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>{log.category}</TableCell>
                      <TableCell>{log.aiModel}</TableCell>
                      <TableCell>{log.provider || 'openai'}</TableCell>
                      <TableCell align="right">{log.tokensUsed.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        {log.costEstimate != null ? `$${log.costEstimate.toFixed(4)}` : '-'}
                      </TableCell>
                      <TableCell align="right">{log.durationMs}ms</TableCell>
                      <TableCell>{log.success ? 'OK' : 'Failed'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Container>
  );
}
