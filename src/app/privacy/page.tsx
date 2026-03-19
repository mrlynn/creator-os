import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const metadata: Metadata = {
  title: 'Privacy Statement | Creator OS',
  description: 'Privacy Statement for Creator OS - how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        component="header"
        sx={{
          py: 2,
          px: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="md">
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowBackIcon />}
            size="small"
            color="inherit"
            sx={{ mb: 1 }}
          >
            Back to home
          </Button>
        </Container>
      </Box>

      <Container maxWidth="md" component="main" sx={{ flex: 1, py: 4 }}>
        <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, mb: 3 }}>
          Privacy Statement
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Last updated: March 19, 2025
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          1. Introduction
        </Typography>
        <Typography variant="body1" paragraph>
          Creator OS (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy
          Statement explains how we collect, use, disclose, and safeguard your information when you use
          our AI-powered content creation platform.
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          2. Information We Collect
        </Typography>
        <Typography variant="body1" paragraph>
          We collect information you provide directly, such as account credentials, profile information,
          content ideas, scripts, and episodes. When you connect third-party platforms (e.g., YouTube,
          TikTok), we receive access to the data you authorize. We also collect usage data, including
          how you interact with the Service and AI features, to improve our product.
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          3. How We Use Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          We use your information to provide, maintain, and improve the Service; to process AI-generated
          content requests; to communicate with you; and to comply with legal obligations. Content you
          create is used to generate scripts and suggestions. We do not use your content to train general
          AI models without your explicit consent.
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          4. AI and Third-Party Processors
        </Typography>
        <Typography variant="body1" paragraph>
          We use third-party AI providers (e.g., OpenAI) to power script generation and other AI
          features. When you use these features, your prompts and relevant content may be sent to these
          providers in accordance with their data processing terms. We select providers that commit to
          appropriate data handling practices.
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          5. Data Storage and Security
        </Typography>
        <Typography variant="body1" paragraph>
          Your data is stored in secure cloud infrastructure (e.g., MongoDB Atlas). We implement
          industry-standard security measures to protect your information from unauthorized access,
          alteration, or destruction. We retain your data for as long as your account is active or as
          needed to provide the Service.
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          6. Your Rights
        </Typography>
        <Typography variant="body1" paragraph>
          Depending on your location, you may have rights to access, correct, delete, or export your
          personal data. You can manage your account settings and connected platforms within the
          Service. To exercise your rights, contact us through the support channels in the Service.
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          7. Cookies and Tracking
        </Typography>
        <Typography variant="body1" paragraph>
          We use cookies and similar technologies for authentication, session management, and to improve
          the Service. We do not sell your personal information to third parties for advertising
          purposes.
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          8. Changes to This Statement
        </Typography>
        <Typography variant="body1" paragraph>
          We may update this Privacy Statement from time to time. We will notify you of material changes
          by posting the updated statement on this page and updating the &quot;Last updated&quot; date. We
          encourage you to review this statement periodically.
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          9. Contact Us
        </Typography>
        <Typography variant="body1" paragraph>
          If you have questions about this Privacy Statement or our data practices, please contact us
          through the support channels available in the Service.
        </Typography>
      </Container>
    </Box>
  );
}
