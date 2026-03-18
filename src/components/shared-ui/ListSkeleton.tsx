'use client';

import { Skeleton, Stack, Grid, Box } from '@mui/material';

interface ListSkeletonProps {
  count?: number;
  variant?: 'card' | 'row' | 'kanban';
}

export function ListSkeleton({ count = 5, variant = 'card' }: ListSkeletonProps) {
  if (variant === 'kanban') {
    const columns = 4;
    const cardsPerCol = 3;
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: `repeat(${columns}, minmax(200px, 1fr))`, md: `repeat(${columns}, 1fr)` },
          gap: 2,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {Array.from({ length: columns }).map((_, colIdx) => (
          <Box key={colIdx} sx={{ p: 2, minHeight: 400, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Skeleton variant="text" width={120} height={28} sx={{ mb: 2 }} animation="wave" />
            <Stack spacing={1.5}>
              {Array.from({ length: cardsPerCol }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={80}
                  sx={{ borderRadius: 1 }}
                  animation="wave"
                />
              ))}
            </Stack>
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === 'row') {
    return (
      <Stack spacing={1}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={48}
            sx={{ borderRadius: 1 }}
            animation="wave"
          />
        ))}
      </Stack>
    );
  }

  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Skeleton
            variant="rectangular"
            height={100}
            sx={{ borderRadius: 2 }}
            animation="wave"
          />
        </Grid>
      ))}
    </Grid>
  );
}
