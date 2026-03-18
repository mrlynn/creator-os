'use client';

import { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ArticleIcon from '@mui/icons-material/Article';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BarChartIcon from '@mui/icons-material/BarChart';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const HELP_SECTIONS = [
  {
    id: 'quick-start',
    title: 'Quick Start',
    searchText: 'quick start idea script episode pipeline flow create generate',
    icon: <HelpOutlineIcon />,
    content: (
      <>
        <Typography variant="body1" paragraph>
          Creator OS helps you go from idea to published content. The core flow:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Create an idea" secondary="/app/ideas/new" />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Create script from idea" secondary="On idea detail page" />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Generate script with AI" secondary="Outline → full draft in ~40 seconds" />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Create episode" secondary="From script detail page" />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Track in Pipeline" secondary="Kanban + calendar view" />
          </ListItem>
        </List>
      </>
    ),
  },
  {
    id: 'ideas',
    title: 'Idea Bank',
    searchText: 'ideas virality score platform audience tags filter status',
    icon: <LightbulbIcon />,
    content: (
      <>
        <Typography variant="body1" paragraph>
          Capture and organize content ideas. Each idea can have a <strong>virality score</strong> (0–100) to help you prioritize.
        </Typography>
        <Typography variant="subtitle2" gutterBottom>Workflow</Typography>
        <List dense>
          <ListItem><ListItemText primary="New Idea — Add title, description, platform, audience, format, and optional tags" /></ListItem>
          <ListItem><ListItemText primary="Virality Score — Auto-calculated on save; use Score button to retry" /></ListItem>
          <ListItem><ListItemText primary="Create Script — Promotes idea into the scripting queue" /></ListItem>
        </List>
        <Typography variant="body2" color="text.secondary">
          Filter ideas by status (raw, validated, scripted, published) and platform.
        </Typography>
      </>
    ),
  },
  {
    id: 'scripts',
    title: 'Script Studio',
    searchText: 'scripts hook problem solution demo CTA outro AI generate outline Hook Lab audience',
    icon: <ArticleIcon />,
    content: (
      <>
        <Typography variant="body1" paragraph>
          Write and AI-generate scripts with structured sections: hook, problem, solution, demo, CTA, outro.
        </Typography>
        <Typography variant="subtitle2" gutterBottom>Features</Typography>
        <List dense>
          <ListItem><ListItemText primary="Outline & Generate — Enter bullet points; AI produces full script in ~40 seconds" /></ListItem>
          <ListItem><ListItemText primary="Script Sections — Edit hook, problem, solution, demo, CTA, outro in accordions" /></ListItem>
          <ListItem><ListItemText primary="Audience Calibration — Toggle Beginner/Advanced to rewrite for different audiences" /></ListItem>
          <ListItem><ListItemText primary="Hook Lab — Generate 5 YouTube + 5 TikTok hooks; save separately per platform" /></ListItem>
          <ListItem><ListItemText primary="Version History — Compare previous versions with diff view" /></ListItem>
        </List>
        <Typography variant="body2" color="text.secondary">
          Scripts auto-version on save. Create an episode when ready for production.
        </Typography>
      </>
    ),
  },
  {
    id: 'pipeline',
    title: 'Publishing Pipeline',
    searchText: 'pipeline kanban calendar publishing records YouTube TikTok status',
    icon: <ViewKanbanIcon />,
    content: (
      <>
        <Typography variant="body1" paragraph>
          Track content through production stages. Use the Kanban board or Calendar view.
        </Typography>
        <Typography variant="subtitle2" gutterBottom>Kanban Columns</Typography>
        <List dense>
          <ListItem><ListItemText primary="Not Started → Recording → Editing → Done" /></ListItem>
        </List>
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Publishing Records</Typography>
        <List dense>
          <ListItem><ListItemText primary="Add a record per platform (YouTube, TikTok, etc.) with status, URL, scheduled date" /></ListItem>
        </List>
        <Typography variant="body2" color="text.secondary">
          Switch to Calendar tab to see scheduled and published content by date.
        </Typography>
      </>
    ),
  },
  {
    id: 'library',
    title: 'Content Library',
    searchText: 'library episodes filter repurpose TikTok clips',
    icon: <VideoLibraryIcon />,
    content: (
      <>
        <Typography variant="body1" paragraph>
          Browse all episodes. Filter by status, series, or tags. Open an episode to see details and repurpose.
        </Typography>
        <Typography variant="subtitle2" gutterBottom>Repurpose</Typography>
        <List dense>
          <ListItem><ListItemText primary="Click Repurpose on an episode with a script" /></ListItem>
          <ListItem><ListItemText primary="AI generates 4–6 TikTok clip concepts with hooks and scripts" /></ListItem>
          <ListItem><ListItemText primary="Copy hooks and scripts for each clip" /></ListItem>
        </List>
        <Typography variant="body2" color="text.secondary">
          One YouTube video can become multiple short-form assets.
        </Typography>
      </>
    ),
  },
  {
    id: 'series',
    title: 'Series',
    searchText: 'series playlists episodes group',
    icon: <CollectionsBookmarkIcon />,
    content: (
      <>
        <Typography variant="body1" paragraph>
          Group episodes into series (e.g. playlists, course modules). Create series, then assign episodes when creating them.
        </Typography>
        <Typography variant="subtitle2" gutterBottom>Workflow</Typography>
        <List dense>
          <ListItem><ListItemText primary="Create series with title and description" /></ListItem>
          <ListItem><ListItemText primary="When creating an episode, select a series from the dropdown" /></ListItem>
          <ListItem><ListItemText primary="View series detail to see all episodes" /></ListItem>
        </List>
      </>
    ),
  },
  {
    id: 'tags',
    title: 'Tags',
    searchText: 'tags category topic platform audience format filter',
    icon: <LocalOfferIcon />,
    content: (
      <>
        <Typography variant="body1" paragraph>
          Organize ideas and episodes with tags. Create tags by category (topic, platform, audience, format).
        </Typography>
        <Typography variant="subtitle2" gutterBottom>Usage</Typography>
        <List dense>
          <ListItem><ListItemText primary="Add tags when creating ideas (TagSelector)" /></ListItem>
          <ListItem><ListItemText primary="Episodes are auto-tagged on creation based on script content" /></ListItem>
          <ListItem><ListItemText primary="Filter Library by tags" /></ListItem>
        </List>
      </>
    ),
  },
  {
    id: 'ai-toolkit',
    title: 'AI Toolkit',
    searchText: 'AI prompts variables template run execute',
    icon: <PsychologyIcon />,
    content: (
      <>
        <Typography variant="body1" paragraph>
          Save prompts with <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 1 }}>{'{{variables}}'}</code> and run them with custom inputs. Reuse prompts without re-entering context.
        </Typography>
        <Typography variant="subtitle2" gutterBottom>Workflow</Typography>
        <List dense>
          <ListItem><ListItemText primary="Create prompt with template (e.g. {'{{title}}'} and {'{{script}}'})" /></ListItem>
          <ListItem><ListItemText primary="Run — Enter variable values, Execute, copy output" /></ListItem>
        </List>
        <Typography variant="body2" color="text.secondary">
          AI usage is logged for cost visibility.
        </Typography>
      </>
    ),
  },
  {
    id: 'analytics',
    title: 'Analytics',
    searchText: 'analytics metrics views likes comments heatmap topic performance',
    icon: <BarChartIcon />,
    content: (
      <>
        <Typography variant="body1" paragraph>
          Log performance metrics per episode. View topic performance to see which tags drive engagement.
        </Typography>
        <Typography variant="subtitle2" gutterBottom>Features</Typography>
        <List dense>
          <ListItem><ListItemText primary="Add snapshot — Episode, platform, date, views, likes, comments, etc." /></ListItem>
          <ListItem><ListItemText primary="Topic Performance — Heatmap of engagement by tag" /></ListItem>
        </List>
      </>
    ),
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return HELP_SECTIONS;
    return HELP_SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.searchText && s.searchText.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <HelpOutlineIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Help & Documentation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Learn how to use Creator OS
            </Typography>
          </Box>
        </Stack>

        <TextField
          fullWidth
          size="small"
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Paper sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Content Creation Flow
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
            <Button component={Link} href="/app/ideas" size="small" variant="outlined">
              Ideas
            </Button>
            <Typography variant="body2" color="text.secondary">→</Typography>
            <Button component={Link} href="/app/scripts" size="small" variant="outlined">
              Scripts
            </Button>
            <Typography variant="body2" color="text.secondary">→</Typography>
            <Button component={Link} href="/app/pipeline" size="small" variant="outlined">
              Episodes
            </Button>
            <Typography variant="body2" color="text.secondary">→</Typography>
            <Button component={Link} href="/app/library" size="small" variant="outlined">
              Library
            </Button>
          </Stack>
        </Paper>

        {filteredSections.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3 }}>
            No documentation matches your search.
          </Typography>
        ) : (
          filteredSections.map((section) => (
            <Accordion key={section.id} defaultExpanded={filteredSections.length <= 3 || section.id === 'quick-start'}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ color: 'primary.main' }}>{section.icon}</Box>
                  <Typography fontWeight={600}>{section.title}</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {section.content}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
    </Container>
  );
}
