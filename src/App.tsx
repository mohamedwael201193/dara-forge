import { PageTransitionLoader } from "@/components/SkeletonLoader";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProviders } from "@/lib/wallet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import ProfessionalNavigation from "./components/ProfessionalNavigation";
import { ToastProvider } from "./components/ToastProvider";
import NotFound from "./pages/NotFound";

// Lazy load pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const TechPage = lazy(() => import("./pages/TechPage"));
const ResearchINFTsPage = lazy(() => import("./pages/ResearchINFTsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PipelinePage = lazy(() => import("./pages/PipelinePage"));
const VerifyPage = lazy(() => import("./pages/VerifyPage"));

const queryClient = new QueryClient();

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              <Suspense fallback={<PageTransitionLoader />}>
                <Home />
              </Suspense>
            </PageWrapper>
          }
        />
        <Route
          path="/tech"
          element={
            <PageWrapper>
              <Suspense fallback={<PageTransitionLoader />}>
                <TechPage />
              </Suspense>
            </PageWrapper>
          }
        />
        <Route path="/nfts" element={<Navigate to="/infts" replace />} />
        <Route
          path="/infts"
          element={
            <PageWrapper>
              <Suspense fallback={<PageTransitionLoader />}>
                <ResearchINFTsPage />
              </Suspense>
            </PageWrapper>
          }
        />
        <Route
          path="/profile"
          element={
            <PageWrapper>
              <Suspense fallback={<PageTransitionLoader />}>
                <ProfilePage />
              </Suspense>
            </PageWrapper>
          }
        />
        <Route
          path="/pipeline"
          element={
            <PageWrapper>
              <Suspense fallback={<PageTransitionLoader />}>
                <PipelinePage />
              </Suspense>
            </PageWrapper>
          }
        />
        <Route
          path="/verify"
          element={
            <PageWrapper>
              <Suspense fallback={<PageTransitionLoader />}>
                <VerifyPage />
              </Suspense>
            </PageWrapper>
          }
        />
        <Route
          path="*"
          element={
            <PageWrapper>
              <NotFound />
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  console.log("App component rendering");
  return (
    <WalletProviders>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ToastProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-gradient-to-br from-deep-navy via-slate-800/20 to-deep-navy">
                <a href="#main-content" className="skip-link">
                  Skip to main content
                </a>
                <ProfessionalNavigation />
                <main id="main-content">
                  <AnimatedRoutes />
                </main>
              </div>
            </BrowserRouter>
          </ToastProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </WalletProviders>
  );
};

export default App;
