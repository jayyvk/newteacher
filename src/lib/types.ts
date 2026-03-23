export type AppScreen = "setup" | "live" | "summary";

export type SubjectOption =
  | "History"
  | "Science"
  | "Math"
  | "English"
  | "Geography"
  | "General";

export type TeacherPersona = {
  id: string;
  name: string;
  description: string;
  ageRange: string;
  agentId: string;
};

export type UploadedMaterial = {
  id: string;
  name: string;
  sizeLabel: string;
  typeLabel: string;
};

export type ClassSetup = {
  className: string;
  subject: SubjectOption;
  topicFocus: string;
  materials: UploadedMaterial[];
  teacherId: string;
  lessonBrief?: string | null;
};

export type TranscriptMessage = {
  id: string;
  role: "student" | "teacher";
  label: string;
  text: string;
};

export type ClassFact = {
  id: string;
  text: string;
};

export type WebSource = {
  title: string;
  url: string;
  content: string;
};
