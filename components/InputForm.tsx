import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserProfile, COUNTRIES, EDUCATION_LEVELS, EXPERIENCE_LEVELS, 
  LEARNING_STYLES, MOTIVATIONS, INDUSTRIES, EMPLOYMENT_TYPES, 
  COMPANY_PREFERENCES, BUDGETS, OBSTACLES 
} from '../types';
import { NeonButton } from './ui/NeonButton';
import { GlassCard } from './ui/GlassCard';
import { extractResumeText, extractSkills } from '../services/resumeParser';

interface InputFormProps {
  onSubmit: (profile: UserProfile) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<UserProfile>({
    // Basics
    name: '',
    country: COUNTRIES[0],
    currentRole: '',
    totalExperienceYears: 0,
    experienceLevel: EXPERIENCE_LEVELS[0],
    industry: INDUSTRIES[0],
    employmentType: EMPLOYMENT_TYPES[1],
    companyTypePreference: COMPANY_PREFERENCES[4],
    
    // Education & Skills
    educationLevel: EDUCATION_LEVELS[1],
    fieldOfStudy: '',
    skills: '',
    linkedInUrl: '',
    portfolioUrl: '',
    certificationInterest: true,

    // Intent
    careerGoal: '',
    shortTermGoal: '',
    longTermGoal: '',
    willingnessToSwitchDomain: false,
    willingnessToRelocate: false,
    preferredCountries: [], 

    // Learning
    learningStyle: LEARNING_STYLES[0],
    weeklyHours: 10,
    dailyAvailability: 'Evenings & Weekends',
    budget: BUDGETS[1],

    // Risk, Motivation & Obstacles
    motivation: MOTIVATIONS[0],
    obstacles: [],
    riskTolerance: 'Medium',
    salaryVsPassion: 50,
    jobStabilityImportance: 70,

    // Constraints
    financialConstraint: false,
    timeConstraint: false,
    visaConstraint: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
       const checked = (e.target as HTMLInputElement).checked;
       setProfile(prev => ({ ...prev, [name]: checked }));
    } else {
       setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMultiSelect = (field: 'preferredCountries' | 'obstacles', value: string) => {
    setProfile(prev => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        if (field === 'preferredCountries' && current.length >= 3) return prev;
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setProfile(prev => ({ ...prev, [e.target.name]: parseInt(e.target.value) }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParseError(null);

    try {
      const cleanText = await extractResumeText(file);
      const extractedSkills = extractSkills(cleanText);
      const skillsString = extractedSkills.length > 0 ? extractedSkills.join(', ') : "";

      setProfile(prev => {
        const existing = prev.skills ? prev.skills + "\n" : "";
        const combinedSkills = existing + (skillsString ? `Detected: ${skillsString}\n` : "") + cleanText.substring(0, 500) + "...";
        return { ...prev, skills: combinedSkills };
      });

    } catch (err: any) {
      console.error(err);
      setParseError(err.message || "Failed to parse file");
    } finally {
      setIsParsing(false);
      e.target.value = '';
    }
  };

  const prevStep = () => setStep(prev => prev - 1);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === totalSteps) {
      onSubmit(profile);
    } else {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reusable Input Styles for consistency
  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">{children}</label>
  );

  const formInputClass = "w-full bg-white/50 dark:bg-dark-900/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200";

  // Render Steps
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Full Name</Label>
          <input type="text" name="name" required value={profile.name} onChange={handleChange} className={formInputClass} placeholder="Jane Doe" />
        </div>
        <div>
          <Label>Current Residence</Label>
          <select name="country" value={profile.country} onChange={handleChange} className={formInputClass}>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Current Job Title</Label>
          <input type="text" name="currentRole" value={profile.currentRole} onChange={handleChange} className={formInputClass} placeholder="e.g. Product Manager" />
        </div>
        <div>
          <Label>Experience (Years)</Label>
          <input type="number" name="totalExperienceYears" value={profile.totalExperienceYears} onChange={handleChange} className={formInputClass} min="0" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Industry</Label>
          <select name="industry" value={profile.industry} onChange={handleChange} className={formInputClass}>
             {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <Label>Employment Status</Label>
          <select name="employmentType" value={profile.employmentType} onChange={handleChange} className={formInputClass}>
             {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Education Level</Label>
          <select name="educationLevel" value={profile.educationLevel} onChange={handleChange} className={formInputClass}>
            {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <Label>Field of Study</Label>
          <input type="text" name="fieldOfStudy" value={profile.fieldOfStudy} onChange={handleChange} className={formInputClass} placeholder="e.g. Computer Science" />
        </div>
      </div>
      
      <div>
        <Label>Skills & Expertise</Label>
        <textarea name="skills" rows={5} value={profile.skills} onChange={handleChange} className={formInputClass} placeholder="List your technical and soft skills here..." />
      </div>
      
      {/* Upload Area */}
      <div className={`
        group relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
        ${parseError ? 'border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-500/30' : 'border-slate-300 dark:border-white/10 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10'}
      `}>
        <input 
            type="file" 
            accept=".txt,.pdf,.docx" 
            onChange={handleFileUpload} 
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" 
            disabled={isParsing}
        />
        
        {isParsing ? (
           <div className="flex flex-col items-center justify-center py-2">
              <svg className="animate-spin h-8 w-8 text-primary mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Analyzing document structure...</span>
           </div>
        ) : parseError ? (
           <div>
               <div className="text-red-500 font-medium mb-1">Upload Failed</div>
               <div className="text-sm text-red-400">{parseError}</div>
           </div>
        ) : (
           <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <div className="text-slate-900 dark:text-white font-medium">Upload Resume / CV</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supports PDF, DOCX, TXT (Auto-extraction)</div>
           </div>
        )}
      </div>

      <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
         <input type="checkbox" name="certificationInterest" checked={profile.certificationInterest} onChange={handleChange} className="w-5 h-5 rounded text-primary focus:ring-primary border-slate-300 dark:border-white/20 dark:bg-dark-900" />
         <label className="text-sm text-slate-700 dark:text-slate-300">Interested in professional certifications</label>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label>Ultimate Career Goal</Label>
        <input type="text" name="careerGoal" required value={profile.careerGoal} onChange={handleChange} className={formInputClass} placeholder="e.g. CTO of a Fintech Company" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Short-term Goal (1 Year)</Label>
          <input type="text" name="shortTermGoal" value={profile.shortTermGoal} onChange={handleChange} className={formInputClass} placeholder="e.g. Senior Promotion" />
        </div>
        <div>
           <Label>Long-term Goal (5 Years)</Label>
           <input type="text" name="longTermGoal" value={profile.longTermGoal} onChange={handleChange} className={formInputClass} placeholder="e.g. Start my own agency" />
        </div>
      </div>
      
      <div>
        <Label>Primary Motivation</Label>
        <select name="motivation" value={profile.motivation} onChange={handleChange} className={formInputClass}>
             {MOTIVATIONS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div>
        <Label>Current Obstacles</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {OBSTACLES.map(obs => (
            <div 
              key={obs} 
              onClick={() => handleMultiSelect('obstacles', obs)}
              className={`
                px-4 py-3 rounded-xl text-sm cursor-pointer border transition-all duration-200
                ${profile.obstacles.includes(obs) 
                  ? 'bg-primary/10 border-primary text-primary font-medium shadow-sm' 
                  : 'bg-white/50 dark:bg-dark-900/50 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-primary/30'}
              `}
            >
              {obs}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
       <div>
         <Label>Compare Opportunities (Max 3)</Label>
         <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {COUNTRIES.map(c => (
              <div 
                key={c}
                onClick={() => handleMultiSelect('preferredCountries', c)}
                className={`
                   px-3 py-2 rounded-lg text-xs cursor-pointer border transition-all
                   ${profile.preferredCountries.includes(c) 
                     ? 'bg-secondary/10 border-secondary text-secondary font-medium' 
                     : 'bg-white/50 dark:bg-dark-900/50 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'}
                `}
              >
                {c}
              </div>
            ))}
         </div>
         <p className="text-xs text-slate-500 mt-2">Selected: {profile.preferredCountries.join(', ') || "None"}</p>
       </div>

       <div className="flex flex-col gap-3">
        {[
          { key: 'willingnessToSwitchDomain', label: 'Open to switching domains/industries' },
          { key: 'willingnessToRelocate', label: 'Open to relocation' }
        ].map((item) => (
          <div key={item.key} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
              <input 
                type="checkbox" 
                name={item.key} 
                // @ts-ignore
                checked={profile[item.key]} 
                onChange={handleChange} 
                className="w-5 h-5 rounded text-primary focus:ring-primary border-slate-300 dark:border-white/20 dark:bg-dark-900" 
              />
              <label className="text-sm text-slate-700 dark:text-slate-300">{item.label}</label>
          </div>
        ))}
      </div>

       <div>
         <Label>Company Preference</Label>
          <select name="companyTypePreference" value={profile.companyTypePreference} onChange={handleChange} className={formInputClass}>
             {COMPANY_PREFERENCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
       </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-8">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
            <Label>Learning Style</Label>
            <select name="learningStyle" value={profile.learningStyle} onChange={handleChange} className={formInputClass}>
              {LEARNING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
         </div>
         <div>
            <Label>Budget</Label>
            <select name="budget" value={profile.budget} onChange={handleChange} className={formInputClass}>
              {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
         </div>
       </div>

       {/* Sliders */}
       <div className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-8">
         <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Weekly Commitment</Label>
              <span className="text-secondary font-bold text-lg bg-secondary/10 px-3 py-1 rounded-lg">{profile.weeklyHours}h</span>
            </div>
            <input 
              type="range" name="weeklyHours" min={1} max={40} value={profile.weeklyHours} onChange={handleSliderChange}
              className="w-full h-2 bg-slate-200 dark:bg-dark-900 rounded-lg appearance-none cursor-pointer accent-secondary"
            />
         </div>

         <div>
            <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
                <span>💰 Prioritize Salary</span>
                <span>🔥 Prioritize Passion</span>
            </div>
            <input 
                type="range" name="salaryVsPassion" min="0" max="100" value={profile.salaryVsPassion} onChange={handleSliderChange}
                className="w-full h-2 bg-gradient-to-r from-green-400 to-red-400 rounded-lg appearance-none cursor-pointer"
            />
         </div>
       </div>

       <div className="bg-red-50 dark:bg-red-500/5 p-6 rounded-2xl border border-red-100 dark:border-red-500/10">
          <h4 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-4">Hard Constraints</h4>
          <div className="space-y-3">
             {[
               { key: 'financialConstraint', label: 'Financial Constraints' },
               { key: 'timeConstraint', label: 'Strict Time Constraints' },
               { key: 'visaConstraint', label: 'Visa / Work Permit Issues' }
             ].map(item => (
                <div key={item.key} className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    name={item.key} 
                    // @ts-ignore
                    checked={profile[item.key]} 
                    onChange={handleChange} 
                    className="w-4 h-4 rounded text-red-500 focus:ring-red-500 border-red-200 dark:border-red-500/30" 
                  />
                  <label className="text-sm text-slate-700 dark:text-slate-400">{item.label}</label>
               </div>
             ))}
          </div>
       </div>
    </div>
  );

  return (
    <GlassCard className="max-w-4xl mx-auto" hoverEffect>
      <form onSubmit={handleSubmit} className="p-4 md:p-8">
        
        {/* Progress Header */}
        <div className="mb-10">
           <div className="flex justify-between items-end mb-4">
             <div>
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                  {step === 1 && "Professional Context"}
                  {step === 2 && "Education & Skills"}
                  {step === 3 && "Goals & Motivation"}
                  {step === 4 && "Global Opportunities"}
                  {step === 5 && "Learning & Risk"}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Tell us about yourself to generate accurate insights.</p>
             </div>
             <span className="text-sm font-medium text-slate-400 dark:text-slate-500 font-mono">Step {step} / {totalSteps}</span>
           </div>
           
           <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-premium-gradient"
               initial={{ width: 0 }}
               animate={{ width: `${(step / totalSteps) * 100}%` }}
               transition={{ duration: 0.5, ease: "easeInOut" }}
             />
           </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
          </motion.div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between mt-12 pt-8 border-t border-slate-100 dark:border-white/10">
          <div className="w-32">
            {step > 1 && (
              <NeonButton type="button" variant="ghost" onClick={prevStep} className="w-full">
                ← Back
              </NeonButton>
            )}
          </div>
          
          <div className="w-40">
            {step < totalSteps ? (
              <NeonButton type="submit" className="w-full">Next Step →</NeonButton>
            ) : (
              <NeonButton type="submit" loading={isLoading} className="w-full">Analyze</NeonButton>
            )}
          </div>
        </div>
      </form>
    </GlassCard>
  );
};