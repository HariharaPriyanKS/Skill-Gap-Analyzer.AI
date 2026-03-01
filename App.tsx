import React, { useState, useEffect, createContext, useContext } from 'react';
import { InputForm } from './components/InputForm';
import { Dashboard } from './components/Dashboard';
import { UserProfile, AnalysisResult } from './types';
import { analyzeProfile } from './services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonButton } from './components/ui/NeonButton';
import { FuturisticBackground } from './components/ui/FuturisticBackground';

// --- Theme Context ---
const ThemeContext = createContext<{
  isDark: boolean;
  toggleTheme: () => void;
}>({ isDark: true, toggleTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

export default function App() {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Theme State
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAnalysis = async (profile: UserProfile) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeProfile(profile);
      setData(result);
    } catch (err) {
      setError("Failed to analyze profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className="min-h-screen font-sans bg-light-50 dark:bg-dark-950 text-slate-900 dark:text-slate-50 transition-colors duration-500 relative overflow-hidden selection:bg-primary selection:text-white">
        
        {/* Futuristic Background Animation */}
        <FuturisticBackground />

        {/* Ambient Background Blobs (Layered underneath via CSS, but listed here for context) */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-60 dark:opacity-80">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-secondary/20 dark:bg-secondary/10 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-accent/20 dark:bg-accent/10 rounded-full blur-[150px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen"></div>
        </div>

        {/* Navbar */}
        <nav className="fixed w-full top-0 z-50 border-b border-white/20 dark:border-white/5 bg-white/70 dark:bg-dark-900/70 backdrop-blur-xl transition-all duration-300">
          <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
              <div className="w-10 h-10 bg-premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <span className="text-lg md:text-xl font-display font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                Skill Gap Analyzer<span className="text-primary">.AI</span>
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                aria-label="Toggle Theme"
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
              
              <NeonButton variant="outline" size="sm" className="hidden md:flex" onClick={() => window.open('https://github.com', '_blank')}>
                Documentation
              </NeonButton>
            </div>
          </div>
        </nav>

        {/* Main Layout */}
        <main className="relative z-10 pt-32 pb-20 px-6">
          <div className="max-w-[1400px] mx-auto">
            <AnimatePresence mode="wait">
              {!data ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div 
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="inline-block px-4 py-1.5 mb-6 rounded-full border border-primary/20 bg-primary/5 dark:bg-primary/10 text-primary font-medium text-sm tracking-wide"
                    >
                      ✨ Next-Gen Career Intelligence
                    </motion.div>
                    
                    <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-tight tracking-tight text-slate-900 dark:text-white">
                      Unlock Your True <br/>
                      <span className="text-transparent bg-clip-text bg-premium-gradient">Career Potential</span>
                    </h1>
                    
                    <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                      AI-powered analysis of your skills against 50M+ job market data points. Get a personalized roadmap, salary forecast, and global opportunity map in seconds.
                    </p>

                    <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                        <span>Resume Parser</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                        <span>Market Predictions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                        <span>Roadmap Gen</span>
                      </div>
                    </div>
                  </div>
                  
                  <InputForm onSubmit={handleAnalysis} isLoading={loading} />
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-200 rounded-xl flex items-center gap-3"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {error}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <Dashboard data={data} onReset={handleReset} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </ThemeContext.Provider>
  );
}