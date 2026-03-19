'use client';

import Image from 'next/image';
import { signIn } from 'next-auth/react';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGitHubLogin = async () => {
    await signIn('github', { redirectTo: '/app/dashboard' });
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      // NextAuth v5: result is { error, code } on failure, or undefined/null on success
      if (result?.error) {
        setError('Invalid email or password');
        setIsLoading(false);
      } else {
        // Success — hard navigate so the session cookie is picked up
        window.location.replace('/app/dashboard');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
      setIsLoading(false);
    }
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Image
            src="/creatoros.png"
            alt="Creator OS"
            width={80}
            height={80}
            style={{ objectFit: 'contain' }}
          />
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
            Creator OS
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary" align="center">
          AI & Developer Content Creation Platform
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<GitHubIcon />}
          onClick={handleGitHubLogin}
          fullWidth
        >
          Sign in with GitHub
        </Button>

        <>
            <Divider sx={{ width: '100%' }}>
              <Typography variant="caption" color="textSecondary">
                or use test account
              </Typography>
            </Divider>

            <Box
              component="form"
              onSubmit={handleCredentialsLogin}
              sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@creatortos.dev"
                required
                size="small"
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="small"
              />
              <Button
                type="submit"
                variant="outlined"
                fullWidth
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={16} /> : null}
              >
                {isLoading ? 'Signing in...' : 'Sign in with credentials'}
              </Button>
            </Box>
        </>
      </Box>
    </Container>
  );
}
