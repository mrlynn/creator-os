'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface CategoryStat {
  category: string;
  tokens: number;
  requests: number;
  estimatedCost: number;
  successRate: number;
  avgDurationMs: number;
}

interface DailyPoint {
  _id: string;
  tokens: number;
  requests: number;
}

interface RecentLog {
  _id: string;
  category: string;
  tokensUsed: number;
  durationMs: number;
  success: boolean;
  aiModel: string;
  createdAt: string;
}

interface UsageData {
  summary: {
    totalTokens: number;
    totalRequests: number;
    estimatedCost: number;
    successRate: number;
    avgDurationMs: number;
  };
  byCategory: CategoryStat[];
  dailyUsage: DailyPoint[];
  recentLogs: RecentLog[];
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box sx={{ color: 'primary.main' }}>{icon}</Box>
        <Typography variant="body2" color="textSecondary">
          {label}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="textSecondary">
          {sub}
        </Typography>
      )}
    </Paper>
  );
}

export default function DashboardPage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchUsage = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/ai-usage-logs?days=${days}`);
        if (!res.ok) throw new Error('Failed to fetch usage data');
        const data = await res.json();
        setUsage(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [days]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatCategory = (cat: string) =>
    cat.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3" component="h1">
            Dashboard
          </Typography>
          <ToggleButtonGroup
            value={days}
            exclusive
            onChange={(_, v) => v && setDays(v)}
            size="small"
          >
            <ToggleButton value={7}>7d</ToggleButton>
            <ToggleButton value={30}>30d</ToggleButton>
            <ToggleButton value={90}>90d</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : usage ? (
          <>
            {/* Summary cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  label="Total Tokens"
                  value={usage.summary.totalTokens.toLocaleString()}
                  sub={`${usage.summary.totalRequests} requests`}
                  icon={<AutoFixHighIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  label="Estimated Cost"
                  value={`$${usage.summary.estimatedCost.toFixed(4)}`}
                  sub="GPT-4 Turbo rate"
                  icon={<AttachMoneyIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  label="Success Rate"
                  value={`${usage.summary.successRate}%`}
                  sub="of all requests"
                  icon={<CheckCircleIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  label="Avg Duration"
                  value={formatDuration(usage.summary.avgDurationMs || 0)}
                  sub="per AI request"
                  icon={<TimerIcon />}
                />
              </Grid>
            </Grid>

            {usage.summary.totalRequests === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  No AI usage recorded in the last {days} days.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Generate a script to start tracking usage.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {/* By category */}
                <Grid item xs={12} md={7}>
                  <Paper sx={{ p: 2.5 }}>
                    <Typography variant="h6" gutterBottom>
                      Usage by feature
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Feature</TableCell>
                          <TableCell align="right">Requests</TableCell>
                          <TableCell align="right">Tokens</TableCell>
                          <TableCell align="right">Cost</TableCell>
                          <TableCell align="right">Avg time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {usage.byCategory.map((cat) => (
                          <TableRow key={cat.category}>
                            <TableCell>
                              <Typography variant="body2">
                                {formatCategory(cat.category)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{cat.requests}</TableCell>
                            <TableCell align="right">{cat.tokens.toLocaleString()}</TableCell>
                            <TableCell align="right">${cat.estimatedCost.toFixed(4)}</TableCell>
                            <TableCell align="right">{formatDuration(cat.avgDurationMs)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </Grid>

                {/* Recent logs */}
                <Grid item xs={12} md={5}>
                  <Paper sx={{ p: 2.5 }}>
                    <Typography variant="h6" gutterBottom>
                      Recent requests
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {usage.recentLogs.map((log) => (
                        <Box
                          key={log._id}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 0.75,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatCategory(log.category)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(log.createdAt).toLocaleString()} •{' '}
                              {log.tokensUsed.toLocaleString()} tokens
                            </Typography>
                          </Box>
                          <Chip
                            label={log.success ? 'ok' : 'fail'}
                            size="small"
                            color={log.success ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </>
        ) : null}
      </Box>
    </Container>
  );
}
