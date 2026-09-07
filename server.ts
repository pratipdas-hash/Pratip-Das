import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set. Please add your Gemini API Key in the AI Studio Settings menu to enable AI parsing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Fallback rule-based resume parser when GEMINI_API_KEY is not set or unavailable
function fallbackParseResumeText(rawText: string, fileName?: string): any {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let fullName = 'Applicant Name';
  let email = '';
  let phone = '';
  let location = '';
  let linkedin = '';
  let github = '';
  let title = 'Experienced Professional';

  // Email regex
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) email = emailMatch[0];

  // Phone regex
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) phone = phoneMatch[0];

  // LinkedIn
  const linkedinMatch = rawText.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  if (linkedinMatch) linkedin = `https://${linkedinMatch[0]}`;

  // GitHub
  const githubMatch = rawText.match(/github\.com\/[a-zA-Z0-9_-]+/i);
  if (githubMatch) github = `https://${githubMatch[0]}`;

  // Extract name from top lines (before email or other contact info)
  if (lines.length > 0) {
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i];
      if (
        line.length > 2 &&
        line.length < 50 &&
        !line.includes('@') &&
        !line.match(/https?:\/\//i) &&
        !line.toLowerCase().includes('resume') &&
        !line.toLowerCase().includes('curriculum') &&
        !line.toLowerCase().includes('page')
      ) {
        fullName = line;
        // Check next line for potential job title
        if (lines[i + 1] && lines[i + 1].length < 60 && !lines[i + 1].includes('@')) {
          title = lines[i + 1];
        }
        break;
      }
    }
  }

  // If filename looks like "Jayant_Resume.pdf", derive name if not detected
  if ((!fullName || fullName === 'Applicant Name') && fileName) {
    const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    if (cleanName.length > 3) fullName = cleanName;
  }

  // Segregate text into sections
  const lowerLines = lines.map((l) => l.toLowerCase());
  let currentSection = 'summary';
  const sectionLines: Record<string, string[]> = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
  };

  const sectionKeywords: Record<string, string[]> = {
    experience: ['experience', 'work history', 'employment', 'work experience', 'professional experience'],
    education: ['education', 'academic', 'qualifications', 'degrees'],
    skills: ['skills', 'technologies', 'technical skills', 'core competencies', 'expertise'],
    projects: ['projects', 'key projects', 'personal projects'],
    summary: ['summary', 'profile', 'about me', 'objective', 'professional summary'],
  };

  for (const line of lines) {
    const lower = line.toLowerCase();
    let matchedSection = '';
    for (const [sec, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some((k) => lower === k || lower === `${k}:` || (lower.startsWith(k) && lower.length < k.length + 10))) {
        matchedSection = sec;
        break;
      }
    }

    if (matchedSection) {
      currentSection = matchedSection;
    } else {
      sectionLines[currentSection]?.push(line);
    }
  }

  // Summary
  const summary = (sectionLines.summary || []).slice(0, 4).join(' ') ||
    `Dynamic ${title} with proven expertise in driving organizational success, delivering high-impact solutions, and collaborating across cross-functional teams.`;

  // Skills
  const rawSkillsText = (sectionLines.skills || []).join(' ');
  const splitSkills = rawSkillsText
    .split(/[,•|/•·\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 35);

  const skills = [
    {
      category: 'Core Competencies',
      skills: splitSkills.length > 0 ? splitSkills.slice(0, 15) : ['Leadership', 'Problem Solving', 'Strategic Planning', 'Process Optimization'],
    },
  ];

  // Experience parsing
  const expLines = sectionLines.experience || [];
  const experiences: any[] = [];
  let curExp: any = null;

  for (const line of expLines) {
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./);
    const dateMatch = line.match(/(?:19|20)\d{2}|present|current/i);

    if (!isBullet && (dateMatch || line.length < 50) && (!curExp || curExp.bullets.length > 0)) {
      if (curExp) experiences.push(curExp);
      curExp = {
        role: line,
        company: 'Company',
        location: '',
        startDate: '',
        endDate: 'Present',
        current: true,
        bullets: [],
      };
    } else if (curExp) {
      const cleanBullet = line.replace(/^[•\-*]\s*/, '').trim();
      if (cleanBullet.length > 5) {
        curExp.bullets.push(cleanBullet);
      }
    }
  }
  if (curExp) experiences.push(curExp);

  if (experiences.length === 0) {
    experiences.push({
      role: title,
      company: 'Organization',
      location: location || 'Remote',
      startDate: '2021',
      endDate: 'Present',
      current: true,
      bullets: [
        'Spearheaded key functional initiatives, collaborating with stakeholders to deliver measurable outcomes.',
        'Streamlined daily workflows and leveraged technical tools to enhance operational efficiency.',
      ],
    });
  }

  // Education
  const eduLines = sectionLines.education || [];
  const education: any[] = [];
  let curEdu: any = null;

  for (const line of eduLines) {
    const isDegree = line.toLowerCase().includes('bachelor') || line.toLowerCase().includes('master') || line.toLowerCase().includes('degree') || line.toLowerCase().includes('b.') || line.toLowerCase().includes('m.') || line.toLowerCase().includes('phd');
    if (isDegree || !curEdu) {
      if (curEdu) education.push(curEdu);
      curEdu = {
        degree: line,
        school: 'University / Institution',
        location: '',
        startDate: '',
        endDate: '',
        gpa: '',
        honors: '',
      };
    } else if (curEdu && curEdu.school === 'University / Institution') {
      curEdu.school = line;
    }
  }
  if (curEdu) education.push(curEdu);

  if (education.length === 0) {
    education.push({
      degree: 'Degree / Academic Qualification',
      school: 'University / College',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      honors: '',
    });
  }

  return {
    personalInfo: {
      fullName,
      title,
      email,
      phone,
      location,
      linkedin,
      github,
      website: '',
    },
    summary,
    experiences,
    education,
    skills,
    projects: [],
    certifications: [],
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. AI Enhance / Rewrite Bullet Point using Google XYZ formula and action verbs
app.post('/api/ai/enhance-bullet', async (req, res) => {
  try {
    const { bullet, targetRole, jobDescription, tone = 'impactful' } = req.body;
    if (!bullet || typeof bullet !== 'string') {
      return res.status(400).json({ error: 'Bullet text is required.' });
    }

    const ai = getGenAI();
    const prompt = `You are an expert ATS Resume Coach and Technical Recruiter.
Enhance the following resume bullet point using the Google XYZ Formula: "Accomplished [X] as measured by [Y] by doing [Z]".
Guidelines:
- Start with a strong action verb (e.g., Spearheaded, Engineered, Accelerated, Overhauled).
- Include realistic quantifiable metrics and business impact placeholders if none exist (e.g., reduced latency by 35%, grew revenue by $250K).
- Eliminate weak filler words (helped, responsible for, worked on).
- Ensure high ATS keyword friendliness for: ${targetRole || 'Professional Role'}.
${jobDescription ? `Incorporate relevant keywords from this Job Description if fitting:\n${jobDescription.slice(0, 1000)}` : ''}
Tone requested: ${tone} (Options: impactful, metric-focused, concise, executive).

Original bullet: "${bullet}"

Provide:
1. "enhanced": The single best rewritten bullet point.
2. "variations": 3 alternative versions (e.g. one concise, one heavily metric-driven, one leadership-oriented).
3. "improvementsMade": Brief note explaining why this ranks higher on ATS and recruiter screens.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            enhanced: { type: Type.STRING },
            variations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            improvementsMade: { type: Type.STRING },
          },
          required: ['enhanced', 'variations', 'improvementsMade'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/ai/enhance-bullet:', error);
    return res.status(500).json({ error: error.message || 'Failed to enhance bullet point.' });
  }
});

// 2. AI Generate / Tailor Summary
app.post('/api/ai/generate-summary', async (req, res) => {
  try {
    const { resumeData, jobDescription, tone = 'professional' } = req.body;
    const ai = getGenAI();

    const prompt = `You are an executive resume writer specializing in ATS-compliant professional profiles.
Generate a compelling 3-4 sentence professional summary tailored to pass Applicant Tracking Systems with maximum keyword relevance.

Resume Context:
- Target Title / Role: ${resumeData?.personalInfo?.title || 'Professional'}
- Experience Summary: ${JSON.stringify(resumeData?.experiences?.slice(0, 3) || [])}
- Key Skills: ${resumeData?.skills?.map((s: any) => s.name).join(', ') || ''}

${jobDescription ? `Target Job Description:\n${jobDescription.slice(0, 1500)}` : ''}
Tone: ${tone}

Requirements:
- Hook the recruiter in the first 10 words.
- Highlight core competencies and proven track record.
- Weave in high-priority ATS keywords without awkward keyword stuffing.
- Avoid first-person pronouns ("I", "my") as standard ATS convention.

Provide:
1. "summary": The optimized 3-4 sentence summary.
2. "keyMatches": Array of keywords matched from the target job.
3. "atsTip": Quick tip on how this summary ranks in applicant screening.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyMatches: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            atsTip: { type: Type.STRING },
          },
          required: ['summary', 'keyMatches', 'atsTip'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/ai/generate-summary:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate summary.' });
  }
});

// 3. AI Deep Job Description Matcher & ATS Fit Analysis
app.post('/api/ai/analyze-job-fit', async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required.' });
    }

    const ai = getGenAI();
    const prompt = `Analyze this resume against the target Job Description to simulate a tier-1 Applicant Tracking System (like Greenhouse, Lever, Workday).

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Target Job Description:
${jobDescription}

Perform a rigorous evaluation:
1. Overall ATS match score (integer from 0 to 100).
2. Found Hard Skills vs Missing Hard Skills (critical technologies, certifications, tools).
3. Found Soft Skills vs Missing Soft Skills (communication, cross-functional leadership, agile, etc.).
4. Section-by-section keyword suggestions (where and how to incorporate missing keywords).
5. Formatting & ATS compliance risks (e.g. missing dates, unclear job titles, length issues).
6. 3 high-impact action recommendations to raise the ATS score by 20+ points immediately.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER },
            foundHardSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingHardSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            foundSoftSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSoftSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywordSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  recommendedSection: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['keyword', 'recommendedSection', 'reason'],
              },
            },
            formattingRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
            highImpactFixes: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'matchScore',
            'foundHardSkills',
            'missingHardSkills',
            'foundSoftSkills',
            'missingSoftSkills',
            'keywordSuggestions',
            'formattingRisks',
            'highImpactFixes',
          ],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/ai/analyze-job-fit:', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze job fit.' });
  }
});

// 4. AI ATS Audit & Full Resume Polish Suggestions
app.post('/api/ai/ats-deep-audit', async (req, res) => {
  try {
    const { resumeData } = req.body;
    const ai = getGenAI();

    const prompt = `Conduct a comprehensive ATS health audit of this resume:
${JSON.stringify(resumeData, null, 2)}

Evaluate:
- Readability & Action Verb Strength
- Quantifiable Results Density (percentages, dollar amounts, scale)
- Cliché and Buzzword Detection (e.g. "go-getter", "team player")
- Standard Header and Chronology Compliance
- Repetitive phrasing check

Output detailed audit scores, flags, and direct replacement suggestions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atsScore: { type: Type.INTEGER },
            metricDensityScore: { type: Type.INTEGER },
            verbStrengthScore: { type: Type.INTEGER },
            criticalWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
            positiveHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
            buzzwordsFound: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  betterAlternative: { type: Type.STRING },
                },
                required: ['word', 'betterAlternative'],
              },
            },
            nextBestSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'atsScore',
            'metricDensityScore',
            'verbStrengthScore',
            'criticalWarnings',
            'positiveHighlights',
            'buzzwordsFound',
            'nextBestSteps',
          ],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/ai/ats-deep-audit:', error);
    return res.status(500).json({ error: error.message || 'Failed to audit resume.' });
  }
});

// Helper to strip basic RTF formatting
function cleanRtf(rtf: string): string {
  return rtf
    .replace(/\\par[d]?/g, '\n')
    .replace(/\\tab/g, '\t')
    .replace(/\\[a-zA-Z0-9\-]+ ?/g, '')
    .replace(/[{}]/g, '')
    .trim();
}

// Helper to extract printable text strings from legacy binary .doc files
function extractPrintableFromDoc(buffer: Buffer): string {
  const binaryStr = buffer.toString('binary');
  const matches = binaryStr.match(/[\x20-\x7E\r\n\t]{4,}/g) || [];
  return matches
    .filter((s) => !s.startsWith('CompObj') && !s.includes('WordDocument') && !s.includes('Microsoft Word'))
    .join('\n');
}

// Helper to extract text from PDF buffer using PDFParse
async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: buffer });
    const resObj = await parser.getText();
    const text = (resObj?.text || '').trim();
    await parser.destroy();
    return text;
  } catch (err) {
    console.warn('extractTextFromPdfBuffer error:', err);
    return '';
  }
}

// Helper to safely extract JSON from AI response even with preamble, markdown fences, or comments
function extractJsonFromText(rawText: string): any {
  if (!rawText || !rawText.trim()) {
    throw new Error('AI returned an empty response.');
  }

  const text = rawText.trim();

  // 1. Direct parse attempt
  try {
    return JSON.parse(text);
  } catch {}

  // 2. Strip markdown code fences ```json ... ``` or ``` ... ```
  const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (markdownMatch && markdownMatch[1]) {
    try {
      return JSON.parse(markdownMatch[1].trim());
    } catch {}
  }

  // 3. Extract substring between first '{' and last '}'
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      try {
        // Clean trailing commas and comments
        const cleaned = candidate
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1');
        return JSON.parse(cleaned);
      } catch {}
    }
  }

  // 4. Fallback sanitized error
  const preview = text.length > 80 ? text.slice(0, 80) + '...' : text;
  throw new Error(`Failed to parse AI output as JSON: ${preview}`);
}

// Endpoint to quickly extract text from uploaded files (PDF, Word DOCX/DOC)
app.post('/api/ai/extract-file-text', async (req, res) => {
  try {
    const { fileBase64, mimeType, fileName } = req.body;
    if (!fileBase64 || typeof fileBase64 !== 'string') {
      return res.status(400).json({ error: 'fileBase64 string is required.' });
    }

    const lowerName = (fileName || '').toLowerCase();
    const buffer = Buffer.from(fileBase64, 'base64');

    // Reject JSON explicitly
    if (lowerName.endsWith('.json') || mimeType === 'application/json' || mimeType?.includes('json')) {
      return res.status(400).json({
        error: 'JSON files are not supported. Please upload your resume in PDF (.pdf) or Word (.docx, .doc) format only.',
      });
    }

    // 1. DOCX
    if (lowerName.endsWith('.docx') || mimeType?.includes('wordprocessingml')) {
      try {
        const { value: docxText } = await mammoth.extractRawText({ buffer });
        return res.json({
          text: docxText || '',
          format: 'docx',
          fileName,
          isBinaryDocument: false,
          wordCount: (docxText || '').split(/\s+/).filter(Boolean).length,
        });
      } catch (err: any) {
        console.warn('Mammoth docx extraction error:', err);
      }
    }

    // 2. Legacy DOC
    if (lowerName.endsWith('.doc') || mimeType?.includes('msword')) {
      try {
        const { value: docText } = await mammoth.extractRawText({ buffer });
        if (docText && docText.trim().length > 30) {
          return res.json({
            text: docText,
            format: 'doc',
            fileName,
            isBinaryDocument: false,
            wordCount: docText.split(/\s+/).filter(Boolean).length,
          });
        }
      } catch {
        // Fallback for OLE2 binary doc
        const extracted = extractPrintableFromDoc(buffer);
        return res.json({
          text: extracted,
          format: 'doc',
          fileName,
          isBinaryDocument: false,
          wordCount: extracted.split(/\s+/).filter(Boolean).length,
        });
      }
    }

    // 3. PDF
    if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
      const pdfText = await extractTextFromPdfBuffer(buffer);
      const wordCount = pdfText ? pdfText.split(/\s+/).filter(Boolean).length : 0;
      return res.json({
        text: pdfText,
        format: 'pdf',
        fileName,
        isBinaryDocument: true,
        wordCount,
        message: wordCount > 0
          ? `PDF parsed successfully (${wordCount} words extracted).`
          : 'PDF document loaded. Gemini multimodal engine will inspect visual layout and text directly.',
      });
    }

    return res.status(400).json({
      error: 'Unsupported file format. Please upload your resume in PDF (.pdf) or Word (.docx, .doc) format only.',
    });
  } catch (error: any) {
    console.error('Error in /api/ai/extract-file-text:', error);
    return res.status(500).json({ error: error.message || 'Failed to extract text from file.' });
  }
});

// 5. AI Parse Old Resume & Migrate Into New Template (Accepts PDF or Word DOCX/DOC formats only)
app.post('/api/ai/parse-old-resume', async (req, res) => {
  try {
    const { oldResumeText, fileBase64, mimeType, fileName } = req.body;

    let textContent = (oldResumeText || '').trim();
    let inlineMediaPart: { inlineData: { mimeType: string; data: string } } | null = null;
    const lowerName = (fileName || '').toLowerCase();

    // Reject JSON files explicitly
    if (lowerName.endsWith('.json') || mimeType === 'application/json' || mimeType?.includes('json')) {
      return res.status(400).json({
        error: 'JSON files are not supported. Please upload your resume in PDF (.pdf) or Word (.docx, .doc) format only.',
      });
    }

    // Process file if provided - strictly PDF or Word
    if (fileBase64 && typeof fileBase64 === 'string') {
      const isPdf = lowerName.endsWith('.pdf') || mimeType === 'application/pdf';
      const isWord =
        lowerName.endsWith('.docx') ||
        lowerName.endsWith('.doc') ||
        mimeType?.includes('wordprocessingml') ||
        mimeType?.includes('msword');

      if (!isPdf && !isWord) {
        return res.status(400).json({
          error: 'Only PDF (.pdf) and Word (.docx, .doc) documents are supported. Please upload a PDF or Word file.',
        });
      }

      const buffer = Buffer.from(fileBase64, 'base64');

      // Check Word documents
      if (lowerName.endsWith('.docx') || mimeType?.includes('wordprocessingml')) {
        try {
          const { value: docxText } = await mammoth.extractRawText({ buffer });
          if (docxText && docxText.trim().length > 10) {
            textContent = docxText.trim();
          }
        } catch (docxErr) {
          console.warn('Error reading docx with mammoth:', docxErr);
        }
      } else if (lowerName.endsWith('.doc') || mimeType?.includes('msword')) {
        try {
          const { value: docText } = await mammoth.extractRawText({ buffer });
          if (docText && docText.trim().length > 10) {
            textContent = docText.trim();
          } else {
            textContent = extractPrintableFromDoc(buffer);
          }
        } catch {
          textContent = extractPrintableFromDoc(buffer);
        }
      } else if (isPdf) {
        // Extract text directly from PDF buffer first (instant, high accuracy)
        const pdfText = await extractTextFromPdfBuffer(buffer);
        if (pdfText && pdfText.length >= 25) {
          textContent = pdfText;
        }

        // Also prepare inlineMediaPart for direct multimodal analysis if needed
        inlineMediaPart = {
          inlineData: {
            mimeType: 'application/pdf',
            data: fileBase64,
          },
        };
      }
    }

    // Validate that we have either extracted text or inline media (PDF)
    if (!inlineMediaPart && (!textContent || textContent.length < 20)) {
      return res.status(400).json({
        error:
          'Please upload your resume in PDF (.pdf) or Word (.docx, .doc) format, or paste your resume text.',
      });
    }

    let ai: GoogleGenAI | null = null;
    try {
      ai = getGenAI();
    } catch (keyErr: any) {
      console.warn('GEMINI_API_KEY not configured. Falling back to local structural parser:', keyErr.message);
      if (textContent && textContent.length > 20) {
        const fallbackResume = fallbackParseResumeText(textContent, fileName);
        return res.json(fallbackResume);
      }
      return res.status(400).json({
        error: 'GEMINI_API_KEY is not set. Please configure your Gemini API key in the AI Studio Settings menu to use full AI resume parsing.',
      });
    }

    const systemPrompt = `You are a World-Class Executive Resume Parser and ATS Migration Engineer.
Extract all candidate information from the provided resume (document file or text) into cleanly formatted, modern, 100% ATS-compliant structured JSON.

Instructions:
1. Extract candidate's full legal name, target job title, email, phone, location (City, State/Country), LinkedIn URL, GitHub URL, and personal portfolio/website URL.
2. Extract the professional summary (or synthesize a compelling, high-impact 3-4 sentence professional summary if only an objective or fragmented summary exists).
3. Extract ALL work experience entries in chronological order. Include:
   - Accurate job role/title
   - Company name
   - Location (City, State/Country or Remote)
   - Start Date (e.g. "Jan 2021", "2019")
   - End Date (e.g. "Present", "Dec 2023")
   - Current role boolean flag
   - Array of individual bullet points. Preserve quantitative metrics (percentages, dollar amounts, scale, team sizes), responsibilities, and achievements. Ensure each bullet begins with a strong past or present action verb.
4. Categorize skills into logical groups (e.g., "Languages & Frameworks", "Cloud & Infrastructure", "Databases & Storage", "Tools & Methodologies", "Leadership & Operations").
5. Extract education entries (degree, school/university, location, graduation/attendance dates, GPA if listed, honors/distinctions if listed).
6. Extract key projects with name, role, link, tech stack, and impact bullet points.
7. Extract relevant certifications (certification name, issuer, issue date, credential ID).

Clean up any garbled OCR characters, weird line breaks, hyphenated line wraps, or formatting artifacts.`;

    let contents: any;
    if (textContent && textContent.length >= 25) {
      // If we have clean text extracted from PDF or Word, text-based generation is most reliable
      contents = `${systemPrompt}\n\nResume Document Content:\n"""\n${textContent.slice(0, 40000)}\n"""\n\nCRITICAL REQUIREMENT: Output strictly a single raw valid JSON object matching the requested schema. Do NOT wrap in markdown fences (\`\`\`json), and do NOT output any conversational text, preamble, or notes (such as "The page contains..."). Output ONLY the JSON object.`;
    } else if (inlineMediaPart) {
      contents = {
        parts: [
          inlineMediaPart,
          {
            text: `${systemPrompt}\n\nPlease parse this resume file carefully. CRITICAL REQUIREMENT: Output strictly a single raw valid JSON object matching the requested schema. Do NOT output any conversational text, preamble, or notes (such as "The page contains..."). Output ONLY the JSON object.`,
          },
        ],
      };
    } else {
      contents = `${systemPrompt}\n\nResume Document Content:\n"""\n${textContent.slice(0, 35000)}\n"""\n\nCRITICAL REQUIREMENT: Output strictly a single raw valid JSON object matching the requested schema.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalInfo: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING },
                title: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                github: { type: Type.STRING },
                website: { type: Type.STRING },
              },
              required: ['fullName', 'email'],
            },
            summary: { type: Type.STRING },
            experiences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  current: { type: Type.BOOLEAN },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['role', 'company', 'bullets'],
              },
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  degree: { type: Type.STRING },
                  school: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  gpa: { type: Type.STRING },
                  honors: { type: Type.STRING },
                },
                required: ['degree', 'school'],
              },
            },
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  skills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['category', 'skills'],
              },
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  link: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  techStack: { type: Type.STRING },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['name', 'bullets'],
              },
            },
            certifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  issuer: { type: Type.STRING },
                  issueDate: { type: Type.STRING },
                  credentialId: { type: Type.STRING },
                },
                required: ['name', 'issuer'],
              },
            },
          },
          required: ['personalInfo', 'summary', 'experiences', 'skills', 'education'],
        },
      },
    });

    const parsed = extractJsonFromText(response.text || '');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/parse-old-resume:', error);
    return res.status(500).json({ error: error.message || 'Failed to parse old resume.' });
  }
});

// 7. AI Role-Based Template Recommender & Generator
app.post('/api/ai/recommend-template-for-role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || typeof role !== 'string') {
      return res.status(400).json({ error: 'Job role is required.' });
    }

    const ai = getGenAI();
    const prompt = `You are a World-Class Executive Recruiter, ATS Algorithm Specialist, and Master Typographer.
Analyze the target job role: "${role}".

Every profession has specific visual, structural, and cultural expectations when recruiters and ATS parsers evaluate resumes:
- Creative/design roles need modern aesthetics and portfolio emphasis.
- Tech/engineering roles need high data density, technical skill visibility, and clean modern mono/sans typography.
- Finance/consulting roles need conservative, high-density, Wall Street-style formatting with quantifiable metrics.
- Healthcare/medical roles need immediate certification and licensing visibility.
- Legal/academic roles need formal, authoritative serif typography and traditional publication/education hierarchy.

Recommend an optimal ATS-compliant template configuration for this exact role "${role}".

Return:
1. "preset": one of "classic-executive", "modern-tech", "creative-hybrid", "minimal-sharp", "compact-dense".
2. "fontFamily": one of "Inter", "Plus Jakarta Sans", "Outfit", "Merriweather", "JetBrains Mono".
3. "primaryColor": hex color string appropriate for this industry (e.g., #0f172a, #1e3a8a, #0f766e, #065f46, #7c3aed, #831843, #18181b, #2563eb, #d97706, #0284c7).
4. "headerStyle": one of "underline", "pill", "minimal-divider", "left-accent", "border-box", "subtle-fill".
5. "bulletStyle": one of "disc", "hyphen", "square", "arrow".
6. "baseFontSize": number between 11.5 and 13.5 (standard is 13).
7. "lineHeight": number between 1.3 and 1.55 (standard is 1.4).
8. "pageMargin": number in mm between 12 and 18 (standard is 14).
9. "sectionGap": number in px between 10 and 18 (standard is 14).
10. "itemGap": number in px between 7 and 12 (standard is 10).
11. "uppercaseHeadings": boolean.
12. "columnLayout": "single" or "two-column-hybrid".
13. "recommendedSectionOrder": array containing exactly ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'] ordered to highlight what hiring managers for "${role}" care about most first!
14. "industryCategory": short string describing the field (e.g. "Software Engineering & Cloud", "Healthcare & Nursing", "Corporate Law", "Investment Banking").
15. "roleRationale": 2-3 sentences explaining why this layout, font, accent color, and section order optimize recruiter engagement and ATS compatibility for "${role}".
16. "keyTips": array of 3 actionable resume writing tips specifically for "${role}".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            preset: { type: Type.STRING },
            fontFamily: { type: Type.STRING },
            primaryColor: { type: Type.STRING },
            headerStyle: { type: Type.STRING },
            bulletStyle: { type: Type.STRING },
            baseFontSize: { type: Type.NUMBER },
            lineHeight: { type: Type.NUMBER },
            pageMargin: { type: Type.NUMBER },
            sectionGap: { type: Type.NUMBER },
            itemGap: { type: Type.NUMBER },
            uppercaseHeadings: { type: Type.BOOLEAN },
            columnLayout: { type: Type.STRING },
            recommendedSectionOrder: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            industryCategory: { type: Type.STRING },
            roleRationale: { type: Type.STRING },
            keyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'preset',
            'fontFamily',
            'primaryColor',
            'headerStyle',
            'bulletStyle',
            'recommendedSectionOrder',
            'industryCategory',
            'roleRationale',
            'keyTips',
          ],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/ai/recommend-template-for-role:', error);
    return res.status(500).json({ error: error.message || 'Failed to tailor template for role.' });
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
