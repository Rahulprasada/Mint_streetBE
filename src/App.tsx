import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/LandingPages/Index";
import InvestmentReports from "./pages/LandingPages/InvestmentReports";
import ResearchPlatform from "./pages/LandingPages/ResearchPlatform";
import AdvisoryServices from "./pages/LandingPages/AdvisoryServices";
import Community from "./pages/LandingPages/Community";
import NotFound from "./pages/LandingPages/NotFound";
import PrivacyPolicy from "./pages/LandingPages/PrivacyPolicy";
import TermsOfService from "./pages/LandingPages/TermsOfService";
import Legal from "./pages/LandingPages/Legal";
import About from "./pages/LandingPages/About";
import Career from "./pages/LandingPages/Career";
import Pricing from "./pages/LandingPages/Pricing";
import Login from "@/pages/LandingPages/Login";
import ForgotPassword from "./pages/LandingPages/ForgotPassword";
import ResponsiveDrawer from "./components/layout/DashBoardBar";
// import DashBoard from "./pages/Dashboard/Index";
import InvestmentAgentLab from "./pages/ResearchAnalysis/InvestmentAgentLab/Index";
import BusinessPromoterAnalysis from "./pages/ResearchAnalysis/BussinessPromotersAnalysis/Index";
import PositionSizing from "./pages/QuantAlogTools/PositionSizing/Index";
import AlgorithmExecution from "./pages/QuantAlogTools/AlgorithmExcecution/Index";
import LeaderShipIntegrityReport from "./pages/ForensicReports/LeaderShipInegrityReport/Index";
import InsiderRelatedPartyActivity from "./pages/ForensicReports/InsiderRelatedPartyActivity/Index";
import GovernanceRedFlagIndex from "./pages/ForensicReports/GovernanceRedFlagIndex/Index";
import WatchListCoverageTrackers from "./pages/Operation&FeedBack/WatchListCoverageTrackers/Index";
import PMreviewApproval from "./pages/Operation&FeedBack/PMreviewApproval/Index";
import ResearchArchivingVersioning from "./pages/Operation&FeedBack/ResearchArchiveVersioning/Index";
import CommentFeedBackCenter from "./pages/Operation&FeedBack/CommentFeedBackCenter/Index";
import ReportBuilderSetting from "./pages/Settings&Integrations/ReportBuilderSetting/Index";
import AlertManager from "./pages/Settings&Integrations/AlertManager/Index";
import UserRolePermission from "./pages/Settings&Integrations/UserRolePermission/Index";
import BrokerApiIntegration from "./pages/Settings&Integrations/BrokerApiIntegration/Index";
import EquityResearchReport from "./pages/ResearchAnalysis/EquityResearchReport/Index";
import NewReportForm from "./pages/ResearchAnalysis/EquityResearchReport/NewReportForm";
import ReportEditor from "./pages/ResearchAnalysis/EquityResearchReport/ReportEditor";
import ScrollToTop from "./components/ui/Scroll";
import Valuation from "./pages/ResearchAnalysis/ValuationModels/Index";
import ValuationModelsPage from "./pages/ResearchAnalysis/ValuationModels/ValuationModelsPage";
import ValuationModelEditorPage from "./pages/ResearchAnalysis/ValuationModels/ValuationModelEditorPage";
import BusinessAnalysisPage from "./pages/ResearchAnalysis/BussinessPromotersAnalysis/BusinessAnalysisPage";
import BusinessAnalysisEditorPage from "./pages/ResearchAnalysis/BussinessPromotersAnalysis/BusinessAnalysisEditor";
import NewBusinessAnalysisPage from "./pages/ResearchAnalysis/BussinessPromotersAnalysis/NewBusinessAnalysis";
import SignalGenerator from "./pages/QuantAlogTools/SignalGenerator/Index";
import BackTestingOptimization from "./pages/QuantAlogTools/BackTestingOptimization/Index";
import { MarcoDashboard } from "./pages/Macro&MarketingIntelligence/MarcoDashboard/Index";
import { BusinessCycleView } from "./pages/Macro&MarketingIntelligence/BusinessCycleView/Index";
import { FiiSmartMoneyTracker } from "./pages/Macro&MarketingIntelligence/FiiSmartMoneyTracker/Index";
import BenchMarking from "./pages/EsgInsight/BenchMarking";
import Sustainability from "./pages/EsgInsight/Sustainability/Index";
import GreenWashingDetectionFlag from "./pages/EsgInsight/GreenWashingDetectionFlags/Index";
import {
  defaultCompanyId,
  esgCompanies,
} from "./pages/EsgInsight/Sustainability/ESGData";
import { useEffect, useState } from "react";
import { ESGAlertsPanel } from "./pages/EsgInsight/ESGReport&Alerts/Index";
import { companies } from "./pages/ForensicReports/Data/ForensicData";
import { getPageTitle, setDocumentTitle } from "./lib/Seo";
import UtBotScreener from "./pages/Utbotscreener/Index";
import { AuthProvider } from "./context/AuthContext";
import { ScreenerProvider } from "./context/ScreenerContext";
import ResultsTable from "./pages/QuantAlogTools/UtBotScreenResults";
import Register from "./pages/LandingPages/Signup";
import SampleHMMScreener from "./pages/HmmScreen";

const queryClient = new QueryClient();

const App = () => {
  const [selectedCompanyId, setSelectedCompanyId] =
    useState<string>(defaultCompanyId);
  const [selectedCompanyId1, setSelectedCompanyId1] = useState<string>(
    companies.length > 0 ? companies[0].id : ""
  );
  const selectedCompany =
    esgCompanies.find((company) => company.companyId === selectedCompanyId) ||
    esgCompanies[0];

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId1(companyId);
  };

  const SEO = () => {
    const location = useLocation();

    useEffect(() => {
      const pageTitle = getPageTitle(location.pathname);
      setDocumentTitle(pageTitle);
    }, [location.pathname]);

    return null;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* <ScrollToTop />
          <SEO /> */}
          <AuthProvider>
            <ScreenerProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route
                  path="/investment-reports"
                  element={<InvestmentReports />}
                />
                <Route
                  path="/research-platform"
                  element={<ResearchPlatform />}
                />
                <Route
                  path="/advisory-services"
                  element={<AdvisoryServices />}
                />
                <Route path="/about" element={<About />} />
                <Route path="/career" element={<Career />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/community" element={<Community />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard" element={<ResponsiveDrawer />}>
                  {/* <Route index element={<DashBoard />} /> */}
                  <Route path="equity-research-report">
                    <Route index element={<EquityResearchReport />} />
                    <Route path="newreport" element={<NewReportForm />} />
                    <Route path=":id" element={<ReportEditor />} />{" "}
                  </Route>
                  <Route
                    path="investment-agent-lab"
                    element={<InvestmentAgentLab />}
                  />
                  <Route path="valuation-models">
                    <Route index element={<Valuation />} />
                    <Route path="valuation" element={<ValuationModelsPage />} />
                    <Route path=":id" element={<ValuationModelEditorPage />} />
                  </Route>
                  <Route path="business-promoter-analysis">
                    <Route index element={<BusinessPromoterAnalysis />} />
                    <Route
                      path="business-analysis"
                      element={<BusinessAnalysisPage />}
                    />
                    <Route path="new" element={<NewBusinessAnalysisPage />} />
                    <Route
                      path=":id"
                      element={<BusinessAnalysisEditorPage />}
                    />
                  </Route>
                  <Route
                    path="signal-generator"
                    element={<SignalGenerator />}
                  />
                  <Route path="position-sizing" element={<PositionSizing />} />
                  <Route
                    path="backtesting-optimization"
                    element={<BackTestingOptimization />}
                  />
                  <Route
                    path="algorithmic-execution"
                    element={<AlgorithmExecution />}
                  />
                  <Route path="ut-bot-screener" element={<UtBotScreener />} />
                  <Route path="hmm-screen" element={<SampleHMMScreener />} />
                  <Route path="results" element={<ResultsTable />} />
                  <Route path="macro-dashboard" element={<MarcoDashboard />} />
                  <Route
                    path="business-cycle-view"
                    element={<BusinessCycleView />}
                  />
                  <Route
                    path="fii-smart-money-tracker"
                    element={<FiiSmartMoneyTracker />}
                  />
                  <Route
                    path="esg-sustainability-analytics"
                    element={
                      <Sustainability
                        company={selectedCompany}
                        selectedCompanyId={selectedCompanyId}
                        setSelectedCompanyId={setSelectedCompanyId}
                      />
                    }
                  />
                  <Route
                    path="greenwashing-detection-flags"
                    element={
                      <GreenWashingDetectionFlag
                        setSelectedCompanyId={setSelectedCompanyId}
                        selectedCompanyId={selectedCompanyId}
                        companyId={selectedCompanyId}
                      />
                    }
                  />
                  <Route
                    path="peer-esg-benchmarking"
                    element={
                      <BenchMarking
                        company={selectedCompany}
                        selectedCompanyId={selectedCompanyId}
                        setSelectedCompanyId={setSelectedCompanyId}
                      />
                    }
                  />
                  <Route
                    path="ESG-Reports-Export-Alerts"
                    element={
                      <ESGAlertsPanel
                        companyId={selectedCompanyId}
                        selectedCompanyId={selectedCompanyId}
                        setSelectedCompanyId={setSelectedCompanyId}
                      />
                    }
                  />
                  <Route
                    path="leadership-integrity-reports"
                    element={
                      <LeaderShipIntegrityReport
                        handleCompanyChange={handleCompanyChange}
                        companyId={selectedCompanyId1}
                        selectedCompanyId1={selectedCompanyId1}
                      />
                    }
                  />
                  <Route
                    path="insider-related-party-activity"
                    element={
                      <InsiderRelatedPartyActivity
                        handleCompanyChange={handleCompanyChange}
                        selectedCompanyId1={selectedCompanyId1}
                        companyId={selectedCompanyId1}
                      />
                    }
                  />
                  <Route
                    path="governance-red-flag-index"
                    element={
                      <GovernanceRedFlagIndex
                        handleCompanyChange={handleCompanyChange}
                        selectedCompanyId1={selectedCompanyId1}
                        companyId={selectedCompanyId1}
                      />
                    }
                  />
                  <Route
                    path="watchlists-coverage-tracker"
                    element={<WatchListCoverageTrackers />}
                  />
                  <Route
                    path="pm-review-approvals"
                    element={<PMreviewApproval />}
                  />
                  <Route
                    path="research-archive-versioning"
                    element={<ResearchArchivingVersioning />}
                  />
                  <Route
                    path="comments-feedback-center"
                    element={<CommentFeedBackCenter />}
                  />
                  <Route
                    path="report-builder-settings"
                    element={<ReportBuilderSetting />}
                  />
                  <Route path="alert-manager" element={<AlertManager />} />
                  <Route
                    path="user-roles-permissions"
                    element={<UserRolePermission />}
                  />
                  <Route
                    path="broker-api-integrations"
                    element={<BrokerApiIntegration />}
                  />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ScreenerProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
