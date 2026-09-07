import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import mammoth from 'mammoth';

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
      throw new Error('GEMINI_API_KEY is not set in the environment.');
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

// Endpoint to quickly extract text from uploaded files (DOCX, DOC, RTF, TXT, MD)
app.post('/api/ai/extract-file-text', async (req, res) => {
  try {
    const { fileBase64, mimeType, fileName } = req.body;
    if (!fileBase64 || typeof fileBase64 !== 'string') {
      return res.status(400).json({ error: 'fileBase64 string is required.' });
    }

    const lowerName = (fileName || '').toLowerCase();
    const buffer = Buffer.from(fileBase64, 'base64');

    // 1. DOCX
    if (lowerName.endsWith('.docx') || mimeType?.includes('wordprocessingml')) {
      try {
        const { value: docxText } = await mammoth.extractRawText({ buffer });
        return res.json({
          text: docxText || '',
          format: 'docx',
          fileName,
          isBinaryDocument: false,
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
        });
      }
    }

    // 3. Plain Text / Markdown / RTF
    if (lowerName.endsWith('.txt') || lowerName.endsWith('.md') || mimeType?.startsWith('text/plain') || mimeType?.startsWith('text/markdown')) {
      const text = buffer.toString('utf-8');
      return res.json({
        text,
        format: 'text',
        fileName,
        isBinaryDocument: false,
      });
    }

    if (lowerName.endsWith('.rtf') || mimeType?.includes('rtf')) {
      const rawText = buffer.toString('utf-8');
      const text = cleanRtf(rawText);
      return res.json({
        text,
        format: 'rtf',
        fileName,
        isBinaryDocument: false,
      });
    }

    // 4. PDF or Image
    const isPdf = lowerName.endsWith('.pdf') || mimeType === 'application/pdf';
    const isImage = /\.(png|jpe?g|webp)$/i.test(lowerName) || mimeType?.startsWith('image/');

    return res.json({
      text: '',
      format: isPdf ? 'pdf' : isImage ? 'image' : 'binary',
      fileName,
      isBinaryDocument: true,
      message: isPdf
        ? 'PDF document loaded. Gemini multimodal engine will parse visual hierarchy, columns, and text directly.'
        : isImage
        ? 'Resume image loaded. Gemini multimodal vision will scan and extract all text and layout.'
        : 'File loaded for direct AI parsing.',
    });
  } catch (error: any) {
    console.error('Error in /api/ai/extract-file-text:', error);
    return res.status(500).json({ error: error.message || 'Failed to extract text from file.' });
  }
});

// 5. AI Parse Old Resume & Migrate Into New Template (Supports PDF, Word DOCX/DOC, Images, RTF, TXT, Raw Text)
app.post('/api/ai/parse-old-resume', async (req, res) => {
  try {
    const { oldResumeText, fileBase64, mimeType, fileName } = req.body;

    let textContent = (oldResumeText || '').trim();
    let inlineMediaPart: { inlineData: { mimeType: string; data: string } } | null = null;
    const lowerName = (fileName || '').toLowerCase();

    // Process file if provided
    if (fileBase64 && typeof fileBase64 === 'string') {
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
      } else if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
        // PDF document: Pass directly to Gemini multimodal via inlineData!
        inlineMediaPart = {
          inlineData: {
            mimeType: 'application/pdf',
            data: fileBase64,
          },
        };
      } else if (/\.(png|jpe?g|webp)$/i.test(lowerName) || mimeType?.startsWith('image/')) {
        // Image document (scan / screenshot)
        let normalizedMime = mimeType || 'image/png';
        if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) normalizedMime = 'image/jpeg';
        if (lowerName.endsWith('.png')) normalizedMime = 'image/png';
        if (lowerName.endsWith('.webp')) normalizedMime = 'image/webp';

        inlineMediaPart = {
          inlineData: {
            mimeType: normalizedMime,
            data: fileBase64,
          },
        };
      } else if (lowerName.endsWith('.rtf') || mimeType?.includes('rtf')) {
        const rawText = buffer.toString('utf-8');
        textContent = cleanRtf(rawText);
      } else if (lowerName.endsWith('.txt') || lowerName.endsWith('.md') || mimeType?.startsWith('text/')) {
        textContent = buffer.toString('utf-8');
      }
    }

    // Validate that we have either inline media (PDF/image) or substantial text
    if (!inlineMediaPart && (!textContent || textContent.length < 20)) {
      return res.status(400).json({
        error:
          'Please upload a valid resume file (PDF, Word .docx/.doc, PNG/JPG scan, TXT, RTF) or paste at least a few sentences of resume text.',
      });
    }

    const ai = getGenAI();
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
    if (inlineMediaPart) {
      contents = [
        inlineMediaPart,
        {
          text: `${systemPrompt}\n\nPlease parse this resume file carefully, including multi-column layouts, sidebars, headers, and bullet points.`,
        },
      ];
    } else {
      contents = `${systemPrompt}\n\nResume Document Text:\n"""\n${textContent.slice(0, 35000)}\n"""`;
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

    const parsed = JSON.parse(response.text || '{}');
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
