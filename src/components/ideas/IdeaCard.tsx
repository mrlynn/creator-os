'use client';

import { Card, CardContent, CardActions, Button, Typography, Box, Chip, Stack } from '@mui/material';
import Link from 'next/link';

interface IdeaCardProps {
  id: string;
  title: string;
  description: string;
  status: string;
  platform: string;
  audience: string;
  format: string;
  viralityScore?: number;
}

export function IdeaCard({
  id,
  title,
  description,
  status,
  platform,
  audience,
  format,
  viralityScore,
}: IdeaCardProps) {
  const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    raw: 'default',
    validated: 'primary',
    scripted: 'success',
    published: 'success',
    archived: 'error',
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {description.substring(0, 100)}...
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={status}
            size="small"
            color={statusColors[status] as any}
            variant="outlined"
          />
          <Chip label={platform} size="small" variant="outlined" />
          <Chip label={audience} size="small" variant="outlined" />
          <Chip label={format} size="small" variant="outlined" />
        </Stack>
        {viralityScore !== undefined && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Virality Score: {viralityScore}/100
            </Typography>
          </Box>
        )}
      </CardContent>
      <CardActions>
        <Link href={`/app/ideas/${id}`} passHref>
          <Button size="small" component="a">
            View Details
          </Button>
        </Link>
      </CardActions>
    </Card>
  );
}
