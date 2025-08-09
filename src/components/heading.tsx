
import { cn } from "@/lib/utils";

interface HeadingsProps {
    title: string;
    description?: string;
    isSubHeading?: boolean;
}

export const Headings = ({ title, description, isSubHeading = false }: HeadingsProps) => {
    return (
        <div>
            <h2
                className={cn(
                    "text-2xl md:text-3xl text-gray-900 font-semibold tracking-tight",
                    isSubHeading && "text-lg md:text-xl text-gray-800"
                )}
            >
                {title}
            </h2>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
    );
};
