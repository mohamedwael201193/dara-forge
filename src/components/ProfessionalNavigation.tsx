import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  CheckCircle,
  Database,
  GitBranch,
  Home,
  Menu,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ConnectWalletButton from "./ConnectWalletButton";

const ProfessionalNavigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "0G Tech", path: "/tech", icon: Database },
    { label: "Pipeline", path: "/pipeline", icon: GitBranch },
    { label: "Verify", path: "/verify", icon: CheckCircle },
    { label: "Research iNFTs", path: "/infts", icon: Sparkles },
    { label: "Profile", path: "/profile", icon: User },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <motion.nav
        role="navigation"
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-slate-900/95 backdrop-blur-md border-b border-slate-800/50 shadow-2xl"
            : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/">
              <motion.div
                className="flex items-center space-x-3 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <Brain className="w-8 h-8 lg:w-10 lg:h-10 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  <motion.div
                    className="absolute inset-0 bg-blue-400/20 rounded-full blur-md"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl lg:text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    DARA Forge
                  </h1>
                  <p className="text-xs text-gray-400">
                    Research iNFT Platform
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map((item, index) => (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      isActive(item.path)
                        ? "bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/20"
                        : "text-gray-300 hover:text-white hover:bg-slate-800/50"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>

                    {isActive(item.path) && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full"
                        layoutId="activeNavItem"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Connect Wallet */}
              <div className="hidden sm:block">
                <ConnectWalletButton />
              </div>

              {/* Mobile Menu Toggle */}
              <motion.button
                className="lg:hidden flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-gray-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              className="fixed top-20 right-4 left-4 bg-slate-900/95 backdrop-blur-md border border-slate-800/50 rounded-2xl shadow-2xl z-50 lg:hidden overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800/50">
                <div className="flex items-center space-x-3 mb-2">
                  <Brain className="w-6 h-6 text-blue-400" />
                  <span className="text-lg font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    DARA Forge
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Decentralized Research iNFT Platform
                </p>
              </div>

              {/* Navigation Items */}
              <div className="p-4">
                <div className="space-y-2">
                  {navItems.map((item, index) => (
                    <Link key={item.path} to={item.path}>
                      <motion.div
                        className={`flex items-center space-x-4 w-full p-4 rounded-xl transition-all duration-300 ${
                          isActive(item.path)
                            ? "bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10"
                            : "text-gray-300 hover:text-white hover:bg-slate-800/50"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 5 }}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            isActive(item.path)
                              ? "bg-blue-500/30"
                              : "bg-slate-700/50"
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Wallet Connection */}
              <div className="p-4 border-t border-slate-800/50 sm:hidden">
                <ConnectWalletButton />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfessionalNavigation;
