export interface InterviewReportType {
  interviewId: string;
  position: string;
  techStack: string;
  experience: number;
  createdAt: string;
  averageRating: number;
  questions: {
    question: string;
    answer: string;
    rating: number;
    feedback: string;
  }[];
}
