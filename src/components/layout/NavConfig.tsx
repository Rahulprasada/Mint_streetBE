// ICON IMPORTS
import InsightsIcon from "@mui/icons-material/Insights";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import CalculateIcon from "@mui/icons-material/Calculate";
import AssessmentIcon from "@mui/icons-material/Assessment";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import TuneIcon from "@mui/icons-material/Tune";
import FunctionsIcon from "@mui/icons-material/Functions";
import MemoryIcon from "@mui/icons-material/Memory";
import TimelineIcon from "@mui/icons-material/Timeline";
import StackedLineChartIcon from "@mui/icons-material/StackedLineChart";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import FlagIcon from "@mui/icons-material/Flag";
import CompareIcon from "@mui/icons-material/Compare";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import ReviewsIcon from "@mui/icons-material/Reviews";
import ArchiveIcon from "@mui/icons-material/Archive";
import FeedbackIcon from "@mui/icons-material/Feedback";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import LinkIcon from "@mui/icons-material/Link"; 
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { Proportions } from 'lucide-react';
import { MonitorCheck } from 'lucide-react';
import { Bot } from 'lucide-react';
import { link } from "fs";
// DASHBOARD SECTIONS
export const DashboardSections = [
  {
    heading: "Research & Analysis",
    items: [
      {
        Title: "Equity Research Reports",
        link: "/dashboard/equity-research-report",
        icon: <InsightsIcon />,
      },
      {
        Title: "Investment Agent Lab",
        link: "/dashboard/investment-agent-lab",
        icon: <ShowChartIcon />,
      },
      {
        Title: "Valuation Models",
        link: "/dashboard/valuation-models",
        icon: <CalculateIcon />,
      },
      {
        Title: "Business & Promoter Analysis",
        link: "/dashboard/business-promoter-analysis",
        icon: <AssessmentIcon />,
      },
    ],
  },
  {
    heading: "Quant & Algo Tools",
    items: [
      {
        Title: "Signal Generator",
        link: "/dashboard/signal-generator",
        icon: <QueryStatsIcon />,
      },
      {
        Title: "Position Sizing",
        link: "/dashboard/position-sizing",
        icon: <TuneIcon />,
      },
      {
        Title: "Backtesting & Optimization",
        link: "/dashboard/backtesting-optimization",
        icon: <FunctionsIcon />,
      },
      {
        Title: "Algorithmic Execution",
        link: "/dashboard/algorithmic-execution",
        icon: <MemoryIcon />,
      },
      // {
      //   Title: "Ut Bot Screener",
      //   link:"/dashboard/ut-bot-screener",
      //   icon: <Bot />
      // },
      // {
      //   Title: "Ut Bot Screener Results",
      //   link:"/dashboard/results",
      //   icon: <MonitorCheck />
      // }
    ],
  },
  {
    heading: "Proprietary Model",
    items: [
      {
        Title: "HMM",
        link:"/dashboard/hmm-screen",
        icon: <Bot />
      },
      {
        Title: "Ut Bot Screener",
        link:"/dashboard/ut-bot-screener",
        icon: <Bot />
      },
      // {
      //   Title: "Ut Bot Screener Results",
      //   link:"/dashboard/results",
      //   icon: <MonitorCheck />
      // }
    ],
  },
  {
    heading: "Macro & Market Intelligence",
    items: [
      {
        Title: "Macro Dashboard",
        link: "/dashboard/macro-dashboard",
        icon: <TimelineIcon />,
      },
      {
        Title: "Business Cycle View",
        link: "/dashboard/business-cycle-view",
        icon: <StackedLineChartIcon />,
      },
      {
        Title: "FII & Smart Money Tracker",
        link: "/dashboard/fii-smart-money-tracker",
        icon: <TrackChangesIcon />,
      },
    ],
  },
  {
    heading: "ESG Insights",
    items: [
      {
        Title: "ESG & Sustainability Analytics",
        link: "/dashboard/esg-sustainability-analytics",
        icon: <WorkspacePremiumIcon />,
      },
      {
        Title: "Greenwashing Detection Flags",
        link: "/dashboard/greenwashing-detection-flags",
        icon: <FlagIcon />,
      },
      {
        Title: "Sector/Peer ESG Benchmarking",
        link: "/dashboard/peer-esg-benchmarking",
        icon: <CompareIcon />,
      },
      {
        Title: "ESG Reports Export & Alerts",
        link: "/dashboard/ESG-Reports-Export-Alerts",
        icon: <Proportions />,
      },
    ],
  },
  {
    heading: "Forensic Reports (Premium)",
    items: [
      {
        Title: "Leadership Integrity Reports",
        link: "/dashboard/leadership-integrity-reports",
        icon: <SupervisorAccountIcon />,
      },
      {
        Title: "Insider & Related Party Activity",
        link: "/dashboard/insider-related-party-activity",
        icon: <ManageSearchIcon />,
      },
      {
        Title: "Governance Red Flag Index",
        link: "/dashboard/governance-red-flag-index",
        icon: <ReportProblemIcon />,
      },
    ],
  },
  {
    heading: "Operations & Feedback",
    items: [
      {
        Title: "Watchlists & Coverage Tracker",
        link: "/dashboard/watchlists-coverage-tracker",
        icon: <PlaylistAddCheckIcon />,
      },
      {
        Title: "PM Review & Approvals",
        link: "/dashboard/pm-review-approvals",
        icon: <ReviewsIcon />,
      },
      {
        Title: "Research Archive & Versioning",
        link: "/dashboard/research-archive-versioning",
        icon: <ArchiveIcon />,
      },
      {
        Title: "Comments & Feedback Center",
        link: "/dashboard/comments-feedback-center",
        icon: <FeedbackIcon />,
      },
    ],
  },
  {
    heading: "Settings & Integrations",
    items: [
      {
        Title: "Report Builder Settings",
        link: "/dashboard/report-builder-settings",
        icon: <SettingsIcon />,
      },
      {
        Title: "Alert Manager",
        link: "/dashboard/alert-manager",
        icon: <NotificationsActiveIcon />,
      },
      {
        Title: "User Roles & Permissions",
        link: "/dashboard/user-roles-permissions",
        icon: <SupervisorAccountIcon />,
      },
      {
        Title: "Broker API Integrations",
        link: "/dashboard/broker-api-integrations",
        icon: <LinkIcon />,
      },
    ],
  },
];
