/**
 * Utility for managing SEO-related functionality
 */

// Set the document title with optional suffix
export const setDocumentTitle = (title: string, includeSuffix = true) => {
  const suffix = " | Mint Street";
  document.title = includeSuffix ? `${title}${suffix}` : title;
};

// Get page title based on pathname
export const getPageTitle = (pathname: string): string => {
  const routes: Record<string, string> = {
    "/": "Mint Street",
    "/investment-reports": "Investment Reports",
    "/research-platform": "Research Platform",
    "/advisory-services": "Advisory Services",
    "/community": "Community",
    "/login": "Login",
    "/about": "About",
    "/contact": "Contact",
    "/careers": "Careers",
    "/terms": "Terms of Service",
    "/privacy": "Privacy Policy",
    "/pricing": "Pricing",
    "/legal": "Legal",
    "/dashboard/equity-research-report": "Equity Reports",
    "/dashboard/equity-research-report/newreport": "New Equity Report",
    "/dashboard/investment-agent-lab": "Agent Selection",
    "/dashboard/valuation-models": "Valuation Models",
    "/dashboard/business-promoter-analysis": "Business Analysis",
    "/dashboard/business-promoter-analysis/new": "New Business Analysis",
    "/dashboard/signal-generator": "Signal Generator",
    "/dashboard/ut-bot-screener": "Ut Bot Screener",
    "/dashboard/position-sizing": "Position Sizing",
    "/dashboard/backtesting-optimization": "Backtesting & Optimization",
    "/dashboard/algorithmic-execution": "Algorithmic Execution",
    "/dashboard/macro-dashboard": "Macro Dashboard",
    "/dashboard/business-cycle-view": "Business Cycle View",
    "/dashboard/fii-smart-money-tracker":"FII Smart Money Tracker",
    "/dashboard/esg-sustainability-analytics": "ESG & Sustainability Analytics",
    "/dashboard/greenwashing-detection-flags": "Greenwashing Detection Flags",
    "/dashboard/peer-esg-benchmarking":"Peer ESG Benchmarking",
    "/dashboard/ESG-Reports-Export-Alerts":" ESG Reports Export Alerts",
    "/dashboard/leadership-integrity-reports":" Leadership Integrity Reports",
    "/dashboard/insider-related-party-activity":" Insider Related Party Activity",
    "/dashboard/governance-red-flag-index":" Governance Red Flag Index",
    "/dashboard/watchlists-coverage-tracker":" Watchlists Coverage Tracker",
    "/dashboard/pm-review-approvals":" PM Review Approvals",
    "/dashboard/research-archive-versioning":" Research Archive Versioning",
    "/dashboard/comments-feedback-center":" Comments Feedback Center",
    "/dashboard/report-builder-settings":" Report Builder Settings",
    "/dashboard/alert-manager":" Alert Manager",
    "/dashboard/user-roles-permissions":" User Roles & Permissions",
    "/dashboard/broker-api-integrations":" Broker API Integrations",
  };

  // Handle dynamic routes with pattern matching
  if (pathname.match(/^\/reports\/[\w-]+$/)) {
    return "Report Editor";
  }
  if (pathname.match(/^\/valuation\/[\w-]+$/)) {
    return "Valuation Model Editor";
  }
  if (pathname.match(/^\/business-analysis\/[\w-]+$/)) {
    return "Business Analysis Editor";
  }

  // Return the title from the routes map or a default title
  return routes[pathname] || "Equity Research Hub";
};
