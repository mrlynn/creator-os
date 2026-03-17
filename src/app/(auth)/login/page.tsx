'use client';

import { signIn } from 'next-auth/react';
import { Box, Button, Container, Typography, TextField, Divider } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = async () => {
    await signIn('github', { redirectTo: '/app/dashboard' });
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirectTo: '/app/dashboard',
        redirect: false,
      });

      if (result?.error) {
        alert('Invalid credentials');
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    } finally {
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
        <Typography variant="h3" component="h1" gutterBottom>
          Creator OS
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center">
          AI & Developer Content Creation Platform
        </Typography>

        {/* Development Login Form */}
        <Box
          component="form"
          onSubmit={handleCredentialsLogin}
          sx={{
            width: '100%',
            maxWidth: 400,
            p: 3,
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Development Login
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
            Email: admin@creatortos.dev | Password: dev123456
          </Typography>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="outlined"
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            {isLoading ? 'Signing in...' : 'Sign in with Email'}
          </Button>
        </Box>

        <Divider sx={{ width: '100%', maxWidth: 400 }}>OR</Divider>

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
