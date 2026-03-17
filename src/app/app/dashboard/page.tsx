import { Container, Typography, Box } from '@mui/material';
import { getServerSession } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Creator OS
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {session?.user?.name && (
            <>Logged in as {session.user.name}</>
          )}
          {!session?.user?.name && 'User logged in'}
        </Typography>
      </Box>
    </Container>
  );
}
