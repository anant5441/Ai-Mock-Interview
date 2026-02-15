import { useState, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Container from "@/components/container";
import { generateCoverLetter } from "@/scripts";
import { exportCoverLetterAsPDF } from "@/lib/export-utils";
import { toast } from "sonner";
import { Loader, Upload, FileText, Copy, Download, RefreshCw } from "lucide-react";
import { db } from "@/config/firebase.config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { CoverLetterInput } from "@/types/cover-letter";

const CoverLetterPage = () => {
    const { userId } = useAuth();
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [tone, setTone] = useState("Professional");
    const [generatedLetter, setGeneratedLetter] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Invalid file type", {
                description: "Please upload a PDF file.",
            });
            return;
        }

        setResumeFile(file);

        // Basic text extraction from PDF (MVP implementation)
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                // For MVP, we'll use a simple text extraction approach
                // In production, you'd want to use a proper PDF parsing library like pdf-parse
                const text = await extractTextFromPDF(arrayBuffer);
                setResumeText(text);
                toast.success("Resume uploaded", {
                    description: "Resume text extracted successfully.",
                });
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            toast.error("Error reading file", {
                description: "Failed to extract text from PDF. Please try again.",
            });
        }
    };

    // MVP: Basic text extraction (for production, use pdf-parse library)
    const extractTextFromPDF = async (_arrayBuffer: ArrayBuffer): Promise<string> => {
        // This is a basic implementation. For production, install and use:
        // npm install pdf-parse
        // import pdf from 'pdf-parse';
        // const data = await pdf(_arrayBuffer);
        // return data.text;

        // For now, return a placeholder that prompts user to paste resume text
        return "PDF text extraction requires additional library. Please paste your resume text below or use a PDF parser library.";
    };

    const handleGenerate = async () => {
        if (!resumeText.trim()) {
            toast.error("Resume required", {
                description: "Please upload a resume or paste resume text.",
            });
            return;
        }

        if (!jobDescription.trim()) {
            toast.error("Job description required", {
                description: "Please enter the job description.",
            });
            return;
        }

        setIsGenerating(true);

        try {
            const input: CoverLetterInput = {
                resumeText,
                jobDescription,
                companyName: companyName.trim() || undefined,
                tone,
            };

            const letter = await generateCoverLetter(input);
            setGeneratedLetter(letter);

            // Save to Firestore (optional)
            if (userId) {
                try {
                    await addDoc(collection(db, "coverLetters"), {
                        userId,
                        jobDescription,
                        companyName: companyName.trim() || null,
                        generatedLetter: letter,
                        tone,
                        createdAt: serverTimestamp(),
                    });
                } catch (error) {
                    // Silently fail - storage is optional
                }
            }

            toast.success("Cover letter generated", {
                description: "Your personalized cover letter is ready!",
            });
        } catch (error) {
            toast.error("Generation failed", {
                description: error instanceof Error ? error.message : "Failed to generate cover letter. Please try again.",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (!generatedLetter.trim()) {
            toast.error("No content to copy", {
                description: "Please generate a cover letter first.",
            });
            return;
        }

        navigator.clipboard.writeText(generatedLetter);
        toast.success("Copied to clipboard", {
            description: "Cover letter copied successfully.",
        });
    };

    const handleDownloadPDF = () => {
        if (!generatedLetter.trim()) {
            toast.error("No content to download", {
                description: "Please generate a cover letter first.",
            });
            return;
        }

        exportCoverLetterAsPDF(generatedLetter);
        toast.success("PDF downloaded", {
            description: "Cover letter saved as PDF.",
        });
    };

    const handleRegenerate = () => {
        setGeneratedLetter("");
        handleGenerate();
    };

    const wordCount = generatedLetter.trim().split(/\s+/).filter((word) => word.length > 0).length;

    return (
        <Container className="py-8 md:py-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold">Cover Letter Generator</h1>
                    <p className="text-muted-foreground">
                        Create personalized cover letters tailored to your resume and job descriptions
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Input Details</CardTitle>
                            <CardDescription>Provide your resume and job information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Resume Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="resume">Resume (PDF)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        ref={fileInputRef}
                                        id="resume"
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        {resumeFile ? resumeFile.name : "Upload Resume PDF"}
                                    </Button>
                                </div>
                                {resumeText && (
                                    <p className="text-xs text-muted-foreground">
                                        Resume text extracted. You can edit it below if needed.
                                    </p>
                                )}
                            </div>

                            {/* Resume Text (Editable) */}
                            <div className="space-y-2">
                                <Label htmlFor="resumeText">Resume Text (Paste or edit extracted text)</Label>
                                <Textarea
                                    id="resumeText"
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    placeholder="Paste your resume text here or upload a PDF..."
                                    rows={8}
                                    className="resize-none"
                                />
                            </div>

                            {/* Job Description */}
                            <div className="space-y-2">
                                <Label htmlFor="jobDescription">Job Description *</Label>
                                <Textarea
                                    id="jobDescription"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the job description here..."
                                    rows={6}
                                    className="resize-none"
                                />
                            </div>

                            {/* Company Name */}
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name (Optional)</Label>
                                <Input
                                    id="companyName"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="e.g., Google, Microsoft..."
                                />
                            </div>

                            {/* Tone Selector */}
                            <div className="space-y-2">
                                <Label htmlFor="tone">Tone</Label>
                                <select
                                    id="tone"
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                >
                                    <option value="Professional">Professional</option>
                                    <option value="Enthusiastic">Enthusiastic</option>
                                    <option value="Concise">Concise</option>
                                </select>
                            </div>

                            {/* Generate Button */}
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !resumeText.trim() || !jobDescription.trim()}
                                className="w-full"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Generate Cover Letter
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Output Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Generated Cover Letter</CardTitle>
                                    <CardDescription>
                                        {wordCount > 0 ? `${wordCount} words` : "Your cover letter will appear here"}
                                    </CardDescription>
                                </div>
                                {generatedLetter && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handleCopy}
                                            title="Copy to clipboard"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handleDownloadPDF}
                                            title="Download as PDF"
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handleRegenerate}
                                            title="Regenerate"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={generatedLetter}
                                onChange={(e) => setGeneratedLetter(e.target.value)}
                                placeholder="Your generated cover letter will appear here..."
                                rows={20}
                                className="resize-none font-mono text-sm"
                            />
                            {generatedLetter && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    You can edit the generated cover letter above.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Container>
    );
};

export default CoverLetterPage;
