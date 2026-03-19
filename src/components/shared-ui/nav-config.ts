import type { SvgIconComponent } from '@mui/icons-material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ArticleIcon from '@mui/icons-material/Article';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BarChartIcon from '@mui/icons-material/BarChart';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export interface NavItem {
  label: string;
  href: string;
  Icon: SvgIconComponent;
  disabled?: boolean;
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

export const SIDEBAR_WIDTH = 220;

export const navGroups: NavGroup[] = [
  {
    label: 'Content Creation',
    items: [
      { label: 'Dashboard', href: '/app/dashboard', Icon: DashboardIcon },
      { label: 'Ideas', href: '/app/ideas', Icon: LightbulbIcon },
      { label: 'Scripts', href: '/app/scripts', Icon: ArticleIcon },
      { label: 'Pipeline', href: '/app/pipeline', Icon: ViewKanbanIcon },
    ],
  },
  {
    label: 'Content Management',
    items: [
      { label: 'Library', href: '/app/library', Icon: VideoLibraryIcon },
      { label: 'Series', href: '/app/series', Icon: CollectionsBookmarkIcon },
      { label: 'Tags', href: '/app/tags', Icon: LocalOfferIcon },
    ],
  },
  {
    label: 'AI & Analytics',
    items: [
      { label: 'AI Toolkit', href: '/app/ai-toolkit', Icon: PsychologyIcon },
      { label: 'Analytics', href: '/app/analytics', Icon: BarChartIcon },
      { label: 'AI Cost', href: '/app/ai-cost', Icon: RequestQuoteIcon },
    ],
  },
  {
    label: null,
    items: [
      { label: 'Settings', href: '/app/settings', Icon: SettingsIcon },
      { label: 'Help', href: '/app/help', Icon: HelpOutlineIcon },
    ],
  },
];
