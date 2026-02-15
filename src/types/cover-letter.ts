export interface CoverLetterInput {
  resumeText: string;
  jobDescription: string;
  companyName?: string;
  tone: string;
}

export interface CoverLetter {
  id?: string;
  userId: string;
  jobDescription: string;
  companyName?: string;
  generatedLetter: string;
  tone: string;
  createdAt: Date;
}
