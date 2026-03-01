
// --- User Inputs ---

export interface UserProfile {
  // 1. Basics
  name: string;
  country: string; // Primary residence
  currentRole: string;
  totalExperienceYears: number;
  experienceLevel: string;
  industry: string;
  employmentType: string;
  companyTypePreference: string;

  // 2. Education & Skills
  educationLevel: string;
  fieldOfStudy: string;
  skills: string;
  linkedInUrl: string;
  portfolioUrl: string;
  certificationInterest: boolean;

  // 3. Career Intent & Goals
  careerGoal: string;
  shortTermGoal: string;
  longTermGoal: string;
  willingnessToSwitchDomain: boolean;
  willingnessToRelocate: boolean;
  preferredCountries: string[]; // For Cross-Country Comparison

  // 4. Learning & Constraints
  learningStyle: string;
  weeklyHours: number;
  dailyAvailability: string;
  budget: string;
  
  // 5. Risk, Motivation & Obstacles
  motivation: string;
  obstacles: string[]; // Multi-select
  riskTolerance: 'Low' | 'Medium' | 'High';
  salaryVsPassion: number;
  jobStabilityImportance: number;

  // 6. Constraints
  financialConstraint: boolean;
  timeConstraint: boolean;
  visaConstraint: boolean;
}

// --- New AI Intelligence Models ---

export interface DetailedAdvisory {
  positiveReinforcement: string; // "You are in the top 10% for..."
  strategicAdvice: string; // "Pivot to X because..."
  obstacleGuidance: string; // "Since you have financial constraints, do this..."
  copingStrategies: string[]; // Bullet points
}

export interface GoalAnalysis {
  realismScore: number; // 0-100
  alignmentAnalysis: string; // "Your goal requires 5 yrs exp, you have 2..."
  suggestedAdjustments: string[];
}

// --- Rich Country Intelligence Model ---

export interface CountryWorkCulture {
  avgWorkingHours: string;
  workLifeBalance: number; // 1-10
  remotePolicy: string;
  overtimeCulture: 'Low' | 'Moderate' | 'High';
}

export interface CountryBenefits {
  paidLeaveDays: string;
  healthcareSystem: string;
  publicHolidays: number;
}

export interface CountryCostOfLiving {
  rentAvg: string; // e.g. "$1200 for 1BHK"
  taxEstimate: string; // e.g. "20-30%"
  buyingPower: 'Low' | 'Medium' | 'High';
}

export interface CountryVisaDetails {
  visaName: string;
  difficultyScore: number; // 1-10
  processingTime: string;
  minSalaryReq: string;
}

export interface CountryQualityOfLife {
  safetyIndex: number; // 1-10
  happinessIndex: number; // 1-10
  englishProficiency: 'Low' | 'Moderate' | 'High' | 'Native';
}

export interface CountryInsight {
  country: string;
  demandIndex: number; // 0-100
  salaryRange: string;
  marketOutlook: string;
  
  // Rich Data Sections
  workCulture: CountryWorkCulture;
  benefits: CountryBenefits;
  costOfLiving: CountryCostOfLiving;
  visaDetails: CountryVisaDetails;
  qualityOfLife: CountryQualityOfLife;
  
  topSkills: string[];
}

export interface RoadmapStage {
  stageName: string; // e.g., "Phase 1: Foundations"
  description: string;
  skills: string[];
  tools: string[];
  projects: {
    title: string;
    description: string;
  }[]; 
  estimatedDuration: string;
  industryRelevance: number; // 1-10
}

export interface MentorAdvice {
  summary: string;
  immediateAction: string;
  motivationalQuote: string;
}

// --- Existing + Updates ---

export interface SkillGap {
  skill: string;
  importance: 'High' | 'Medium' | 'Low';
  description: string;
  impactOnSalary: string;
  learningResource: {
    name: string;
    type: 'Course' | 'Article' | 'Project';
    url: string;
    isPaid: boolean;
  }[];
}

export interface SkillRiskAnalysis {
  skill: string;
  status: 'Emerging' | 'Stable' | 'Declining';
  riskLevel: 'Low' | 'Medium' | 'High';
  reason: string;
}

export interface JobRecommendation {
  title: string;
  matchPercentage: number;
  salaryRange: string;
  missingSkills: string[];
  rationale: string;
}

export interface FutureTrend {
  trend: string;
  growthRate: string;
  description: string;
  impactOnUser: string;
}

export interface AnalysisResult {
  // Core Scores
  readinessScore: number;
  readinessExplanation: string;
  
  // New Intelligence Modules
  advisory: DetailedAdvisory; 
  goalAnalysis: GoalAnalysis; 
  countryComparison: CountryInsight[]; 
  structuredRoadmap: RoadmapStage[];
  mentorAdvice: MentorAdvice;
  
  // Legacy/Existing Logic Preserved
  matchedSkills: string[];
  missingSkills: SkillGap[];
  skillRiskProfile: SkillRiskAnalysis[];
  recommendations: JobRecommendation[];
  trends: FutureTrend[];
  topEmergingSkill: string;
  
  salaryForecast: {
      currentRange: string;
      year3Projection: string;
      year5Projection: string;
      growthFactors: string[];
  };
  
  persona: {
      archetype: string;
      strengths: string[];
      blindSpots: string[];
      growthStrategy: string;
  };
}

// --- Constants ---

export const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Germany", "France", 
  "Australia", "India", "Singapore", "Japan", "Brazil", "China", 
  "South Africa", "United Arab Emirates", "Netherlands", "Switzerland"
];

export const OBSTACLES = [
  "Lack of Time / Busy Schedule",
  "Financial Constraints",
  "Lack of Mentorship",
  "Career Confusion / Lack of Direction",
  "Skill Overwhelm",
  "Fear of Failure / Imposter Syndrome",
  "No Professional Network",
  "Visa / Immigration Barriers"
];

export const EXPERIENCE_LEVELS = [
  "Entry Level (0-2 years)",
  "Mid Level (3-5 years)",
  "Senior Level (5+ years)",
  "Executive (10+ years)"
];

export const EDUCATION_LEVELS = [
  "High School",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Self-Taught / Bootcamps"
];

export const LEARNING_STYLES = [
  "Visual (Videos, Diagrams)",
  "Auditory (Podcasts, Lectures)",
  "Reading/Writing (Books, Articles)",
  "Kinesthetic (Hands-on Projects)",
  "Mixed / Adaptive"
];

export const MOTIVATIONS = [
  "Higher Salary / Financial Freedom",
  "Career Pivot / New Industry",
  "Remote Work / Flexibility",
  "Leadership / Management Track",
  "Passion / Personal Interest",
  "Job Stability / Security",
  "Innovation / Building New Tech"
];

export const INDUSTRIES = [
  "Technology & Software",
  "Data Science & AI",
  "Finance & Fintech",
  "Healthcare & Biotech",
  "Marketing & Digital Media",
  "E-commerce & Retail",
  "Manufacturing & Engineering",
  "Education & EdTech",
  "Creative Arts & Design",
  "Consulting & Strategy",
  "Other"
];

export const EMPLOYMENT_TYPES = [
  "Student", "Full-time Employed", "Freelancer/Contractor", "Career Break/Sabbatical", "Unemployed"
];

export const COMPANY_PREFERENCES = [
  "Early Stage Startup", "Growth Stage Startup", "MNC / Enterprise", "Government / Public Sector", "Open to Anything"
];

export const BUDGETS = [
  "Free Resources Only", "Low Budget (<$100)", "Medium Budget ($100-$1000)", "High Budget (Unlimited)"
];
