import { Container, Typography, Box } from '@mui/material';
import { IdeaCaptureForm } from '@/components/ideas/IdeaCaptureForm';

export default function NewIdeaPage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Capture New Idea
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Quickly capture your content ideas. You can refine them later.
        </Typography>
        <IdeaCaptureForm />
      </Box>
    </Container>
  );
}
