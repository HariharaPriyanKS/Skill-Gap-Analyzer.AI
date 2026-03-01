
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProfile = async (profile: UserProfile): Promise<AnalysisResult> => {
  const prompt = `
    Act as a "Principal AI Career Architect" and "Global Labor Market Analyst".
    Execute the following 7 Intelligence Engines for the user profile below.

    USER PROFILE:
    - Name: ${profile.name}
    - From: ${profile.country}
    - Role: ${profile.currentRole} (${profile.totalExperienceYears} yrs exp)
    - Education: ${profile.educationLevel}, ${profile.fieldOfStudy}
    - Skills: ${profile.skills}
    - Goal: ${profile.careerGoal} (Short: ${profile.shortTermGoal}, Long: ${profile.longTermGoal})
    - Obstacles: ${profile.obstacles.join(', ')}
    - Target Countries: ${profile.preferredCountries.join(', ') || "Global Top 3"}
    - Learning: ${profile.weeklyHours} hrs/week, ${profile.learningStyle}, Budget: ${profile.budget}

    --- ENGINE INSTRUCTIONS ---

    1. **Motivational & Advisory Engine**:
       - Generate "positiveReinforcement" referencing specific strengths.
       - Generate "strategicAdvice" on how to pivot or grow.
       - Generate "obstacleGuidance" specifically addressing: ${profile.obstacles.join(', ')}.

    2. **Goal Alignment Engine**:
       - Calculate "realismScore" (0-100).
       - Logic: If goal requires 5 yrs exp and user has 1, score is low.
       - Provide "suggestedAdjustments".

    3. **Accuracy Enhancement Layer (Readiness Score)**:
       - Calculate "readinessScore" (0-100) using this conceptual formula:
         Score = (Skill_Match_Weight * 0.5) + (Demand_Score * 0.3) + (Experience_Adjustment * 0.2) - (Risk_Factors).
       - Explain the score in "readinessExplanation".

    4. **Deep Country Intelligence**:
       - For ${profile.country} AND ${profile.preferredCountries.join(' and ')}.
       - Provide DEEP INSIGHTS including:
         - Work Culture (Avg hours, WLB score, remote policy).
         - Benefits (Leave days, healthcare).
         - Cost of Living (Rent estimate, Buying Power).
         - Visa (Target visa name, Difficulty 1-10, Processing time).
         - Quality of Life (Safety, Happiness).

    5. **Deep Roadmap Engine**:
       - Create a STAGE-BASED roadmap.
       - For each stage, list: Skills, Specific Tools, and a Real-world Project Idea.

    6. **Skill Intelligence**:
       - Identify missing skills and classify obsolescence risk.

    7. **Salary Intelligence**:
       - Forecast salary growth over 3 and 5 years.

    --- OUTPUT ---
    Return ONLY valid JSON matching the schema below.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            // 1. Advisory
            advisory: {
                type: Type.OBJECT,
                properties: {
                    positiveReinforcement: { type: Type.STRING },
                    strategicAdvice: { type: Type.STRING },
                    obstacleGuidance: { type: Type.STRING },
                    copingStrategies: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            },
            // 2. Goal
            goalAnalysis: {
                type: Type.OBJECT,
                properties: {
                    realismScore: { type: Type.NUMBER },
                    alignmentAnalysis: { type: Type.STRING },
                    suggestedAdjustments: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            },
            // 3. Country Comparator (Rich Data)
            countryComparison: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        country: { type: Type.STRING },
                        demandIndex: { type: Type.NUMBER },
                        salaryRange: { type: Type.STRING },
                        marketOutlook: { type: Type.STRING },
                        topSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                        
                        // New Rich Sections
                        workCulture: {
                          type: Type.OBJECT,
                          properties: {
                            avgWorkingHours: { type: Type.STRING },
                            workLifeBalance: { type: Type.NUMBER }, // 1-10
                            remotePolicy: { type: Type.STRING },
                            overtimeCulture: { type: Type.STRING, enum: ['Low', 'Moderate', 'High'] }
                          }
                        },
                        benefits: {
                          type: Type.OBJECT,
                          properties: {
                            paidLeaveDays: { type: Type.STRING },
                            healthcareSystem: { type: Type.STRING },
                            publicHolidays: { type: Type.NUMBER }
                          }
                        },
                        costOfLiving: {
                          type: Type.OBJECT,
                          properties: {
                            rentAvg: { type: Type.STRING },
                            taxEstimate: { type: Type.STRING },
                            buyingPower: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
                          }
                        },
                        visaDetails: {
                          type: Type.OBJECT,
                          properties: {
                            visaName: { type: Type.STRING },
                            difficultyScore: { type: Type.NUMBER }, // 1-10
                            processingTime: { type: Type.STRING },
                            minSalaryReq: { type: Type.STRING }
                          }
                        },
                        qualityOfLife: {
                          type: Type.OBJECT,
                          properties: {
                            safetyIndex: { type: Type.NUMBER },
                            happinessIndex: { type: Type.NUMBER },
                            englishProficiency: { type: Type.STRING, enum: ['Low', 'Moderate', 'High', 'Native'] }
                          }
                        }
                    }
                }
            },
            // 4. Structured Roadmap
            structuredRoadmap: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        stageName: { type: Type.STRING },
                        description: { type: Type.STRING },
                        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                        tools: { type: Type.ARRAY, items: { type: Type.STRING } },
                        projects: { 
                          type: Type.ARRAY, 
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              title: { type: Type.STRING },
                              description: { type: Type.STRING }
                            }
                          }
                        },
                        estimatedDuration: { type: Type.STRING },
                        industryRelevance: { type: Type.NUMBER }
                    }
                }
            },
            // Legacy Fields
            readinessScore: { type: Type.NUMBER },
            readinessExplanation: { type: Type.STRING },
            matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skill: { type: Type.STRING },
                  importance: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                  description: { type: Type.STRING },
                  impactOnSalary: { type: Type.STRING },
                  learningResource: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['Course', 'Article', 'Project'] },
                            url: { type: Type.STRING },
                            isPaid: { type: Type.BOOLEAN }
                        }
                    }
                  }
                }
              }
            },
            skillRiskProfile: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        skill: { type: Type.STRING },
                        status: { type: Type.STRING, enum: ['Emerging', 'Stable', 'Declining'] },
                        riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                        reason: { type: Type.STRING }
                    }
                }
            },
            salaryForecast: {
                type: Type.OBJECT,
                properties: {
                    currentRange: { type: Type.STRING },
                    year3Projection: { type: Type.STRING },
                    year5Projection: { type: Type.STRING },
                    growthFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            },
            persona: {
                type: Type.OBJECT,
                properties: {
                    archetype: { type: Type.STRING },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    blindSpots: { type: Type.ARRAY, items: { type: Type.STRING } },
                    growthStrategy: { type: Type.STRING }
                }
            },
            mentorAdvice: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    immediateAction: { type: Type.STRING },
                    motivationalQuote: { type: Type.STRING }
                }
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  matchPercentage: { type: Type.NUMBER },
                  salaryRange: { type: Type.STRING },
                  missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  rationale: { type: Type.STRING }
                }
              }
            },
            trends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  trend: { type: Type.STRING },
                  growthRate: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impactOnUser: { type: Type.STRING }
                }
              }
            },
            topEmergingSkill: { type: Type.STRING },
            summary: { type: Type.STRING }
          }
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as AnalysisResult;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
