'use client';

import { signIn } from 'next-auth/react';
import { Box, Button, Container, Typography } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function LoginPage() {
  const handleGitHubLogin = async () => {
    await signIn('github', { redirectTo: '/app/dashboard' });
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 3,
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Creator OS
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center">
          AI & Developer Content Creation Platform
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<GitHubIcon />}
          onClick={handleGitHubLogin}
        >
          Sign in with GitHub
        </Button>
      </Box>
    </Container>
  );
}
