'use client';

import { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Stack } from '@mui/material';
import Link from 'next/link';

interface Script {
  _id: string;
  title: string;
  status: string;
  wordCount: number;
  createdAt: string;
}

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const response = await fetch('/api/scripts');
        if (!response.ok) throw new Error('Failed to fetch scripts');
        const { data } = await response.json();
        setScripts(data);
      } finally {
        setLoading(false);
      }
    };

    fetchScripts();
  }, []);

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3" component="h1">
            Scripts
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {scripts.length} script{scripts.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {scripts.length === 0 ? (
          <Typography color="textSecondary">No scripts yet. Create one from an idea.</Typography>
        ) : (
          <Stack spacing={2}>
            {scripts.map((script) => (
              <Link key={script._id} href={`/app/scripts/${script._id}`} passHref>
                <Box
                  component="a"
                  sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                >
                  <Typography variant="h6">{script.title}</Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      {script.wordCount} words
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Status: {script.status}
                    </Typography>
                  </Stack>
                </Box>
              </Link>
            ))}
          </Stack>
        )}
      </Box>
    </Container>
  );
}
