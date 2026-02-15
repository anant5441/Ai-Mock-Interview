import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";
import type { CoverLetterInput } from "@/types/cover-letter";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

const safetySettings = [
    {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

export const chatSession = model.startChat({
    generationConfig,
    safetySettings,
});

/**
 * Generate a personalized cover letter using Gemini AI
 */
export async function generateCoverLetter(input: CoverLetterInput): Promise<string> {
    const prompt = `You are a professional career coach and hiring expert.

Write a personalized cover letter using:

Resume:
${input.resumeText}

Job Description:
${input.jobDescription}

Company:
${input.companyName || "Not specified"}

Tone:
${input.tone}

Requirements:
- 300–450 words
- Professional formatting
- Strong opening paragraph
- Align skills directly with job description
- Highlight measurable impact
- Clear confident closing
- DO NOT hallucinate skills not in resume
- Return plain formatted text only`;

    try {
        const result = await chatSession.sendMessage(prompt);
        return result.response.text().trim();
    } catch (error) {
        throw new Error(`Failed to generate cover letter: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}