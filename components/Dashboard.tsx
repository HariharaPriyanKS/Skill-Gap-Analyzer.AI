
import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult, CountryInsight } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { NeonButton } from './ui/NeonButton';
import { useTheme } from '../App';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell
} from 'recharts';

interface DashboardProps {
  data: AnalysisResult;
  onReset: () => void;
}

// --- Helper Components ---

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-10">
    <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
      {title}
    </h2>
    <div className="h-1.5 w-16 bg-primary rounded-full mb-4"></div>
    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
      {subtitle}
    </p>
  </div>
);

// --- New Premium Country Detail Components ---

const ProgressBar = ({ value, max = 10, color = "bg-primary" }: { value: number; max?: number; color?: string }) => (
  <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${(value / max) * 100}%` }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`h-full ${color}`}
    />
  </div>
);

const DetailRow = ({ label, value, icon }: { label: string; value: string | number | undefined; icon?: React.ReactNode }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5 last:border-0">
    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
      {icon}
      {label}
    </div>
    <div className="text-slate-900 dark:text-white font-semibold text-sm text-right">{value || "N/A"}</div>
  </div>
);

const DetailCard = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={`p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 ${className}`}>
    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">{title}</h4>
    {children}
  </div>
);

// --- Interactive Map Components ---

interface MapNode extends CountryInsight {
  x: number;
  y: number;
}

const SkillNetworkMap = ({ data }: { data: CountryInsight[] }) => {
  const { isDark } = useTheme();
  const [selectedNode, setSelectedNode] = useState<CountryInsight | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const nodes: MapNode[] = React.useMemo(() => {
    return data.map((country, i) => {
      const angle = (i / data.length) * 2 * Math.PI;
      const radius = 180 + (i * 35); 
      return {
        ...country,
        x: Math.cos(angle) * radius + 400,
        y: Math.sin(angle) * radius + 300,
      };
    });
  }, [data]);

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const newZoom = Math.min(Math.max(zoom - e.deltaY * 0.001, 0.5), 2.5);
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        setPan({ x: width / 2 - 400, y: height / 2 - 300 });
    }
  }, []);

  return (
    <div className="relative w-full h-[600px] bg-slate-50 dark:bg-dark-950 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-inner group">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] pointer-events-none"
        style={{ 
            backgroundImage: `linear-gradient(${isDark ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#fff' : '#000'} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            transform: `translate(${pan.x % 40}px, ${pan.y % 40}px) scale(${zoom})`
        }} 
      />

      {/* Controls */}
      <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
        <button onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))} className="p-3 bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-white transition-colors">+</button>
        <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-3 bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-white transition-colors">-</button>
        <button onClick={() => { setPan({x: 0, y: 0}); setZoom(1); }} className="p-3 bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-lg hover:bg-slate-50 dark:hover:bg-white/5 text-xs text-slate-700 dark:text-white transition-colors">Reset</button>
      </div>
      
      {/* Interactive Canvas */}
      <div 
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <motion.div 
            className="w-full h-full origin-top-left"
            style={{ x: pan.x, y: pan.y, scale: zoom }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
             <svg className="overflow-visible w-full h-full absolute top-0 left-0 pointer-events-none">
                {/* Connection Lines */}
                {nodes.map((node, i) => (
                    nodes.map((target, j) => {
                        if (i < j && (Math.abs(node.demandIndex - target.demandIndex) < 15)) {
                            return (
                                <motion.line 
                                    key={`${i}-${j}`}
                                    x1={node.x} y1={node.y}
                                    x2={target.x} y2={target.y}
                                    stroke={node.demandIndex > 80 ? "#ec4899" : (isDark ? "#334155" : "#cbd5e1")}
                                    strokeWidth={node.demandIndex > 80 ? 1.5 : 0.5}
                                    strokeOpacity={0.3}
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5 }}
                                />
                            )
                        }
                        return null;
                    })
                ))}
             </svg>

             {/* Nodes */}
             {nodes.map((node) => (
                 <motion.div
                    key={node.country}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ left: node.x, top: node.y }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(node);
                    }}
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                 >
                    {/* Ripple */}
                    {node.demandIndex > 80 && (
                        <div className="absolute inset-0 rounded-full bg-secondary/30 animate-ping"></div>
                    )}
                    
                    {/* Node Circle */}
                    <div 
                        className={`relative flex items-center justify-center w-20 h-20 rounded-full border-2 shadow-2xl backdrop-blur-md transition-colors ${
                            selectedNode?.country === node.country 
                                ? 'bg-white text-slate-900 border-white scale-110 z-20' 
                                : node.demandIndex > 80 
                                    ? 'bg-dark-900/90 border-secondary text-secondary dark:text-secondary' 
                                    : 'bg-white/90 dark:bg-dark-900/90 border-slate-300 dark:border-slate-700 text-slate-500'
                        }`}
                    >
                        <div className="text-center">
                            <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">{node.country.substring(0, 3)}</div>
                            <div className="text-lg font-bold">{node.demandIndex}</div>
                        </div>
                    </div>

                    {/* Label */}
                    {(zoom > 1.2 || node.demandIndex > 85) && (
                        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white/90 dark:bg-black/80 px-3 py-1.5 rounded-lg shadow-lg text-xs font-semibold text-slate-800 dark:text-white backdrop-blur-sm border border-slate-100 dark:border-white/10">
                            {node.country}
                        </div>
                    )}
                 </motion.div>
             ))}
        </motion.div>
      </div>

      {/* RICH COUNTRY DETAIL MODAL */}
      <AnimatePresence>
        {selectedNode && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-4 md:inset-10 bg-white/95 dark:bg-dark-950/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl z-30 overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-none p-6 md:p-8 border-b border-slate-200 dark:border-white/10 flex justify-between items-start bg-slate-50/50 dark:bg-white/5">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                             <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white">{selectedNode.country}</h3>
                             <div className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedNode.demandIndex > 80 ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/20 text-slate-600 dark:text-slate-300'}`}>
                                Demand Score: {selectedNode.demandIndex}
                             </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-2xl">{selectedNode.marketOutlook}</p>
                    </div>
                    <button onClick={() => setSelectedNode(null)} className="p-2 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors">
                        <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content Scrollable */}
                <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    
                    {/* Top Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                       <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                          <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Salary Potential</div>
                          <div className="text-xl md:text-2xl font-bold font-mono">{selectedNode.salaryRange}</div>
                       </div>
                       <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Visa Difficulty</div>
                          <div className={`text-xl font-bold ${selectedNode.visaDetails?.difficultyScore > 7 ? 'text-red-500' : 'text-green-500'}`}>
                             {selectedNode.visaDetails?.difficultyScore}/10
                             <span className="text-sm font-normal text-slate-400 ml-2">
                               ({selectedNode.visaDetails?.difficultyScore > 7 ? "Strict" : selectedNode.visaDetails?.difficultyScore > 4 ? "Moderate" : "Easy"})
                             </span>
                          </div>
                       </div>
                       <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Safety Index</div>
                          <div className="flex items-center gap-2">
                             <span className="text-xl font-bold text-slate-900 dark:text-white">{selectedNode.qualityOfLife?.safetyIndex || "N/A"}/10</span>
                             <ProgressBar value={selectedNode.qualityOfLife?.safetyIndex || 0} max={10} color="bg-green-500" />
                          </div>
                       </div>
                    </div>

                    {/* Detailed Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* 1. Work Culture */}
                        <DetailCard title="Work Culture">
                            <div className="space-y-1">
                                <DetailRow label="Avg Hours/Week" value={selectedNode.workCulture?.avgWorkingHours} />
                                <div className="py-3">
                                   <div className="flex justify-between text-sm mb-1">
                                      <span className="text-slate-500 dark:text-slate-400">Work-Life Balance</span>
                                      <span className="font-bold text-slate-900 dark:text-white">{selectedNode.workCulture?.workLifeBalance}/10</span>
                                   </div>
                                   <ProgressBar value={selectedNode.workCulture?.workLifeBalance || 0} max={10} color="bg-secondary" />
                                </div>
                                <DetailRow label="Remote Policy" value={selectedNode.workCulture?.remotePolicy} />
                                <DetailRow label="Overtime Culture" value={selectedNode.workCulture?.overtimeCulture} />
                            </div>
                        </DetailCard>

                        {/* 2. Visa & Migration */}
                        <DetailCard title="Visa & Eligibility">
                             <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10 mb-4">
                                <div className="p-2 bg-primary rounded-lg text-white">
                                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                </div>
                                <div>
                                   <div className="text-xs font-bold text-primary uppercase">Target Visa</div>
                                   <div className="font-bold text-slate-900 dark:text-white">{selectedNode.visaDetails?.visaName || "Standard Work Permit"}</div>
                                </div>
                             </div>
                             <div className="space-y-1">
                                <DetailRow label="Processing Time" value={selectedNode.visaDetails?.processingTime} />
                                <DetailRow label="Min Salary Req" value={selectedNode.visaDetails?.minSalaryReq} />
                                <DetailRow label="English Level" value={selectedNode.qualityOfLife?.englishProficiency} />
                             </div>
                        </DetailCard>

                        {/* 3. Cost of Living */}
                        <DetailCard title="Financial Reality">
                             <div className="grid grid-cols-2 gap-4 mb-4">
                                 <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-center">
                                     <div className="text-xs text-slate-500 mb-1">Avg Rent (1BHK)</div>
                                     <div className="font-bold text-slate-900 dark:text-white">{selectedNode.costOfLiving?.rentAvg || "N/A"}</div>
                                 </div>
                                 <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-center">
                                     <div className="text-xs text-slate-500 mb-1">Buying Power</div>
                                     <div className={`font-bold ${selectedNode.costOfLiving?.buyingPower === 'High' ? 'text-green-500' : 'text-amber-500'}`}>
                                        {selectedNode.costOfLiving?.buyingPower}
                                     </div>
                                 </div>
                             </div>
                             <DetailRow label="Est. Tax Rate" value={selectedNode.costOfLiving?.taxEstimate} />
                             <DetailRow label="Healthcare" value={selectedNode.benefits?.healthcareSystem} />
                        </DetailCard>

                        {/* 4. Benefits & Lifestyle */}
                        <DetailCard title="Lifestyle & Benefits">
                             <div className="grid grid-cols-2 gap-4 mb-2">
                                 <div>
                                    <div className="text-3xl font-bold text-primary">{selectedNode.benefits?.paidLeaveDays || "20+"}</div>
                                    <div className="text-xs text-slate-500 uppercase">Paid Leave Days</div>
                                 </div>
                                 <div>
                                    <div className="text-3xl font-bold text-secondary">{selectedNode.benefits?.publicHolidays || "10"}</div>
                                    <div className="text-xs text-slate-500 uppercase">Public Holidays</div>
                                 </div>
                             </div>
                             <div className="py-3 mt-2">
                                   <div className="flex justify-between text-sm mb-1">
                                      <span className="text-slate-500 dark:text-slate-400">Happiness Index</span>
                                      <span className="font-bold text-slate-900 dark:text-white">{selectedNode.qualityOfLife?.happinessIndex}/10</span>
                                   </div>
                                   <ProgressBar value={selectedNode.qualityOfLife?.happinessIndex || 0} max={10} color="bg-yellow-400" />
                            </div>
                        </DetailCard>

                    </div>

                    {/* Footer Skills */}
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Top In-Demand Skills</div>
                        <div className="flex flex-wrap gap-2">
                            {(selectedNode.topSkills || []).map(skill => (
                                <span key={skill} className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const { isDark } = useTheme();

  const skillGapData = data.missingSkills.map(s => ({
    skill: s.skill,
    gap: s.importance === 'High' ? 100 : s.importance === 'Medium' ? 60 : 30,
  })).slice(0, 5);

  return (
    <div className="w-full pb-32">
      
      {/* --- HERO SUMMARY --- */}
      <section className="relative py-16 md:py-24 border-b border-slate-200 dark:border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary font-bold text-sm mb-6"
             >
               Strategic Career Report
             </motion.div>
             <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 dark:text-white mb-6 leading-tight">
               Career <span className="text-transparent bg-clip-text bg-premium-gradient">Blueprint</span>
             </h1>
             <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
               Comprehensive market analysis and strategic roadmap based on your unique profile.
             </p>
          </div>
          <div className="text-right hidden md:block">
             <div className="text-sm text-slate-400 uppercase tracking-widest mb-2">Generated On</div>
             <div className="text-xl font-mono text-slate-900 dark:text-white">{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </section>

      {/* --- 1. READINESS & OVERVIEW --- */}
      <section className="py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Gauge Visualization */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative flex justify-center"
          >
             <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full border-[2px] border-slate-100 dark:border-white/5 relative flex items-center justify-center bg-white/50 dark:bg-white/5 backdrop-blur shadow-2xl">
                <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="45" fill="none" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="6" />
                   <circle 
                      cx="50" cy="50" r="45" fill="none" stroke="url(#premiumGrad)" strokeWidth="6" 
                      strokeDasharray={`${data.readinessScore * 2.83} 283`}
                      strokeLinecap="round"
                      className="filter drop-shadow-lg"
                   />
                   <defs>
                      <linearGradient id="premiumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                   </defs>
                </svg>
                <div className="text-center">
                   <span className="block text-7xl md:text-8xl font-display font-bold text-slate-900 dark:text-white tracking-tighter">{data.readinessScore}</span>
                   <span className="text-lg font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-2 block">Readiness</span>
                </div>
             </div>
          </motion.div>

          {/* Interpretation */}
          <div>
            <SectionHeader 
              title="Market Readiness" 
              subtitle="A quantified measure of your alignment with current global market demands."
            />
            <GlassCard className="p-10 !border-l-4 !border-l-primary">
               <p className="text-lg text-slate-700 dark:text-slate-300 leading-8 mb-8">
                 {data.readinessExplanation}
               </p>
               <div className="flex flex-wrap gap-4">
                  <div className="px-5 py-3 bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl text-green-700 dark:text-green-400 font-bold flex items-center gap-2">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                     {data.matchedSkills.length} Strong Matches
                  </div>
                  <div className="px-5 py-3 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-700 dark:text-red-400 font-bold flex items-center gap-2">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                     {data.missingSkills.length} Critical Gaps
                  </div>
               </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* --- 2. ADVISORY --- */}
      <section className="py-24 border-t border-slate-200 dark:border-white/5">
           <SectionHeader 
              title="Strategic Advisory" 
              subtitle="Personalized strategic guidance tailored to your psychological profile." 
           />
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <GlassCard className="lg:col-span-2 p-10 !bg-gradient-to-br from-indigo-50 to-white dark:from-primary/20 dark:to-transparent !border-primary/20 dark:!border-primary/30">
                 <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">Strategic Direction</h3>
                 <p className="text-2xl md:text-4xl font-display font-medium text-slate-900 dark:text-white leading-tight mb-10">
                   "{data.advisory?.strategicAdvice}"
                 </p>
                 <div className="flex items-start gap-4 pt-8 border-t border-primary/10 dark:border-white/10">
                    <div className="p-3 bg-secondary rounded-xl text-white shadow-lg shadow-secondary/30">
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                       <h4 className="font-bold text-slate-900 dark:text-white text-lg">Immediate Action</h4>
                       <p className="text-slate-600 dark:text-slate-300 mt-1">{data.mentorAdvice?.immediateAction}</p>
                    </div>
                 </div>
              </GlassCard>

              <div className="space-y-6">
                 <GlassCard className="p-8">
                    <h3 className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-4">Your Edge</h3>
                    <p className="text-lg text-slate-700 dark:text-slate-300 italic leading-relaxed">
                       {data.advisory?.positiveReinforcement}
                    </p>
                 </GlassCard>
                 <GlassCard className="p-8 border-red-200 dark:border-red-500/20">
                    <h3 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-4">Risk Management</h3>
                    <ul className="space-y-4">
                       {data.advisory?.copingStrategies?.slice(0,3).map((s, i) => (
                          <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-300 text-sm">
                             <span className="text-red-500 mt-0.5">•</span>
                             <span className="leading-relaxed">{s}</span>
                          </li>
                       ))}
                    </ul>
                 </GlassCard>
              </div>
           </div>
      </section>

      {/* --- 3. SKILL INTELLIGENCE & MAP --- */}
      <section className="py-24">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-10 gap-8">
            <SectionHeader 
                title="Global Skill Matrix" 
                subtitle="Interactive demand heatmap across your target regions." 
            />
            <div className="flex gap-8">
                <div className="text-right">
                    <div className="text-3xl font-display font-bold text-slate-900 dark:text-white">{data.countryComparison.length}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Markets</div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-display font-bold text-transparent bg-clip-text bg-premium-gradient">{data.topEmergingSkill}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Top Trend</div>
                </div>
            </div>
        </div>
        
        <SkillNetworkMap data={data.countryComparison} />

        {/* Charts Grid */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Skill Gap Analysis</h3>
              <div className="h-[400px] w-full p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillGapData} layout="vertical" margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} horizontal={true} vertical={false} />
                       <XAxis type="number" hide />
                       <YAxis dataKey="skill" type="category" width={140} tick={{fill: isDark ? '#94a3b8' : '#64748b', fontSize: 13, fontWeight: 500}} axisLine={false} tickLine={false} />
                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} itemStyle={{color: isDark ? '#fff' : '#0f172a'}} />
                       <Bar dataKey="gap" radius={[0, 6, 6, 0]} barSize={24}>
                          {skillGapData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.gap > 80 ? '#ec4899' : '#6366f1'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
           
           <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Risk Profile</h3>
              <div className="space-y-4">
                 {data.skillRiskProfile.slice(0,4).map((risk, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-primary/30 transition-colors shadow-sm">
                       <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{risk.skill}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${risk.riskLevel === 'High' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{risk.reason}</span>
                          </div>
                       </div>
                       <div className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                          {risk.status}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* --- 4. ROADMAP --- */}
      <section className="py-24">
         <SectionHeader title="Execution Roadmap" subtitle="Your stage-by-stage master plan." />
         
         <div className="relative mt-12">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-white/10 hidden md:block"></div>
            <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200 dark:bg-white/10 md:hidden"></div>

            <div className="space-y-20">
               {(data.structuredRoadmap || []).map((stage, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <motion.div 
                       key={index}
                       initial={{ opacity: 0, y: 30 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       transition={{ duration: 0.5, delay: index * 0.1 }}
                       className={`relative flex flex-col md:flex-row gap-8 ${isEven ? '' : 'md:flex-row-reverse'}`}
                    >
                       {/* Center Node */}
                       <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white dark:bg-dark-900 border-4 border-primary rounded-full z-10 shadow-[0_0_0_8px_rgba(99,102,241,0.15)] flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                       </div>

                       {/* Content Card */}
                       <div className={`w-full md:w-[calc(50%-40px)] ml-20 md:ml-0 ${!isEven ? 'md:text-right' : ''}`}>
                          <div className={`inline-block mb-4 px-3 py-1 rounded text-xs font-bold tracking-widest uppercase ${isEven ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                             Phase {index + 1} • {stage.estimatedDuration}
                          </div>
                          <GlassCard className="p-8 hover:border-primary/40 group">
                             <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors">{stage.stageName}</h3>
                             <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">{stage.description}</p>
                             
                             <div className={`flex flex-wrap gap-2 mb-6 ${!isEven ? 'md:justify-end' : ''}`}>
                                {stage.skills.slice(0, 4).map(t => (
                                   <span key={t} className="px-3 py-1 bg-slate-100 dark:bg-white/10 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300">
                                      {t}
                                   </span>
                                ))}
                             </div>

                             {stage.projects.length > 0 && (
                               <div className={`p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-white/5 dark:to-transparent border border-slate-100 dark:border-white/5 ${!isEven ? 'md:text-left' : ''}`}>
                                  <div className="text-xs text-slate-400 uppercase font-bold mb-1">Key Deliverable</div>
                                  <div className="font-bold text-slate-900 dark:text-white">{stage.projects[0].title}</div>
                               </div>
                             )}
                          </GlassCard>
                       </div>
                    </motion.div>
                  );
               })}
            </div>
         </div>
      </section>

      {/* --- 5. RECOMMENDATIONS --- */}
      <section className="py-24 border-t border-slate-200 dark:border-white/5">
           <SectionHeader title="High-Growth Roles" subtitle="Opportunities perfectly matching your upgraded profile." />
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.recommendations.map((job, i) => (
                 <GlassCard key={i} className="flex flex-col h-full p-0" hoverEffect>
                    <div className="p-8 flex-grow">
                       <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{job.title}</h3>
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-sm font-bold rounded-lg">{job.matchPercentage}%</span>
                       </div>
                       <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">"{job.rationale}"</p>
                       <div className="flex flex-wrap gap-2">
                          {job.missingSkills.slice(0, 3).map(s => (
                             <span key={s} className="px-2 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300 rounded text-xs border border-red-100 dark:border-red-500/20">{s}</span>
                          ))}
                       </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
                       <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Salary Range</div>
                       <div className="text-lg font-mono font-bold text-slate-900 dark:text-white">{job.salaryRange}</div>
                    </div>
                 </GlassCard>
              ))}
           </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-12 text-center">
         <NeonButton variant="outline" onClick={onReset} size="lg">
            Start New Analysis
         </NeonButton>
      </section>
      
    </div>
  );
};
