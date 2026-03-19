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
  title: 'Terms of Service | Creator OS',
  description: 'Terms of Service for Creator OS - AI-powered content creation platform.',
};

export default function TermsPage() {
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
          Terms of Service
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Last updated: March 19, 2025
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          1. Acceptance of Terms
        </Typography>
        <Typography variant="body1" paragraph>
          By accessing or using Creator OS (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
          If you do not agree to these terms, please do not use the Service.
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          2. Description of Service
        </Typography>
        <Typography variant="body1" paragraph>
          Creator OS is an AI-powered content creation platform designed for developer advocates and content
          creators. The Service helps you transform ideas into scripts, manage episodes, and publish content
          across platforms including YouTube, TikTok, and long-form channels.
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          3. Account and Registration
        </Typography>
        <Typography variant="body1" paragraph>
          You must create an account to use certain features of the Service. You are responsible for
          maintaining the confidentiality of your account credentials and for all activities that occur
          under your account. You agree to provide accurate and complete information when registering.
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          4. Acceptable Use
        </Typography>
        <Typography variant="body1" paragraph>
          You agree to use the Service only for lawful purposes and in accordance with these Terms. You
          may not use the Service to create content that is illegal, harmful, defamatory, or infringes
          on the rights of others. You retain ownership of content you create; however, you grant us a
          license to process and store your content as necessary to provide the Service.
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          5. AI-Generated Content
        </Typography>
        <Typography variant="body1" paragraph>
          The Service uses artificial intelligence to assist with script generation and content creation.
          AI-generated content is provided as a starting point and should be reviewed and edited by you.
          We do not guarantee the accuracy, quality, or suitability of AI-generated content for any
          particular purpose.
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          6. Third-Party Services
        </Typography>
        <Typography variant="body1" paragraph>
          The Service may integrate with third-party platforms (e.g., YouTube, TikTok). Your use of those
          platforms is subject to their respective terms and policies. We are not responsible for the
          availability or functionality of third-party services.
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          7. Limitation of Liability
        </Typography>
        <Typography variant="body1" paragraph>
          To the maximum extent permitted by law, Creator OS and its providers shall not be liable for
          any indirect, incidental, special, consequential, or punitive damages arising from your use
          of the Service. Our total liability shall not exceed the amount you paid for the Service in
          the twelve months preceding the claim.
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          8. Changes
        </Typography>
        <Typography variant="body1" paragraph>
          We may modify these Terms at any time. We will notify you of material changes by posting the
          updated Terms on this page and updating the &quot;Last updated&quot; date. Your continued use of the
          Service after such changes constitutes acceptance of the revised Terms.
        </Typography>

        <Typography variant="h2" sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 4, mb: 2 }}>
          9. Contact
        </Typography>
        <Typography variant="body1" paragraph>
          If you have questions about these Terms, please contact us through the support channels
          available in the Service.
        </Typography>
      </Container>
    </Box>
  );
}
