import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure Worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

/**
 * SKILL DICTIONARY
 * A robust list of common technical and professional skills for extraction matching.
 */
const COMMON_SKILLS = new Set([
  "python", "javascript", "typescript", "react", "angular", "vue", "node.js", "express", "django", "flask",
  "java", "c++", "c#", ".net", "golang", "rust", "php", "ruby", "rails", "swift", "kotlin", "flutter",
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins", "cicd", "git", "github", "gitlab",
  "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "graphql", "rest api",
  "machine learning", "deep learning", "ai", "nlp", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
  "data analysis", "data visualization", "tableau", "power bi", "excel",
  "project management", "agile", "scrum", "jira", "confluence",
  "communication", "leadership", "problem solving", "teamwork",
  "figma", "adobe xd", "ui/ux", "html", "css", "sass", "tailwind"
]);

/**
 * cleanResumeText
 * Cleans extracted text by removing artifacts, non-printables, and normalizing spacing.
 */
export const cleanResumeText = (text: string): string => {
  if (!text) return "";

  let cleaned = text;

  // 1. Normalize Unicode (e.g. decompose accents, unify quotes)
  cleaned = cleaned.normalize("NFKD");

  // 2. Remove replacement characters and common PDF artifacts
  cleaned = cleaned.replace(/\ufffd/g, ""); // Remove 
  cleaned = cleaned.replace(/[]/g, ""); // explicit check

  // 3. Remove non-printable characters (keep newlines, tabs, and standard ASCII/Latin)
  // Converting to ASCII-safe or keeping valid UTF-8 letters/numbers/punctuation
  cleaned = cleaned.replace(/[^\x20-\x7E\n\r\t\u00A0-\u024F]/g, " ");

  // 4. Clean formatting
  cleaned = cleaned
    .replace(/\t/g, " ")      // Tabs to spaces
    .replace(/\r\n/g, "\n")   // Normalize CRLF
    .replace(/\r/g, "\n");    // Normalize CR

  // 5. Aggressive Whitespace Cleaning
  // Remove spaces at start/end of lines
  cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');
  
  // Replace multiple spaces with single space
  cleaned = cleaned.replace(/ +/g, " ");
  
  // Limit consecutive newlines to 2 (max 1 empty line between paragraphs)
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  return cleaned.trim();
};

/**
 * extractSkills
 * Extracts unique skills from the cleaned text using the dictionary.
 */
export const extractSkills = (text: string): string[] => {
  const normalizedText = text.toLowerCase();
  const foundSkills: string[] = [];
  
  // We tokenize by splitting on non-word chars to match simple words,
  // but for multi-word skills (e.g. "node.js", "machine learning"), we need checks.
  // Simple iteration for this demo:
  
  COMMON_SKILLS.forEach(skill => {
    // Escape special regex characters in skill name (like C++, .NET)
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Boundary check: ensure "Java" doesn't match "Javascript"
    // We look for word boundaries, but also handle symbols like C++ or .NET correctly.
    const regex = new RegExp(`(^|[^a-z0-9])${escapedSkill}(?![a-z0-9])`, 'i');
    
    if (regex.test(normalizedText)) {
      foundSkills.push(skill); // Return the dictionary version for consistent casing (or original)
    }
  });

  return foundSkills;
};

/**
 * extractResumeText
 * Main entry point. Determines file type and parses accordingly.
 */
export const extractResumeText = async (file: File): Promise<string> => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    let rawText = "";

    // 1. PDF Handler
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // Join items with space, but respect checks for new lines could be improved with 'transform'
        // For basic resumes, joining items usually works decently.
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + "\n";
      }
      
      if (!fullText.trim()) {
        throw new Error("PDF parsed but returned empty text. It might be an image-based PDF (OCR required).");
      }
      rawText = fullText;
    } 
    // 2. DOCX Handler
    else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      fileName.endsWith('.docx')
    ) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      rawText = result.value;
    }
    // 3. Text/Plain Handler
    else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      rawText = await file.text();
    } 
    // Unsupported
    else {
      throw new Error("Unsupported file format. Please upload PDF, DOCX, or TXT.");
    }

    // Pipeline: Clean -> Validate
    const cleanedText = cleanResumeText(rawText);
    
    if (cleanedText.length < 50) {
      throw new Error("Extracted text is too short. Please check the file content.");
    }

    return cleanedText;

  } catch (error: any) {
    console.error("Resume Extraction Error:", error);
    // Propagate friendly error message
    if (error.message.includes("image-based")) throw error;
    throw new Error(`Failed to parse file: ${error.message || "Unknown error"}`);
  }
};
