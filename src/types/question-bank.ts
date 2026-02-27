import { FieldValue, Timestamp } from "firebase/firestore";

export interface QuestionBank {
    id: string;
    title: string;
    description: string;
    techStack: string[];
    experienceLevel: number;
    createdBy: string;
    createdByName: string;
    isPublic: boolean;
    questions: string[];
    createdAt: Timestamp | FieldValue;
    likes: number;
}
