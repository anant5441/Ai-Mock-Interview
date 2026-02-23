import { Timestamp } from "firebase/firestore";

export interface UserFeedback {
    id: string;
    userId: string;
    userName: string;
    userImage: string | null;
    message: string;
    createdAt: Timestamp;
}
