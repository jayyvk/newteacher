"use client";

import { useEffect, useState } from "react";
import { ClassSetupScreen } from "@/components/ClassSetupScreen";
import { ClassSummaryScreen } from "@/components/ClassSummaryScreen";
import { LiveClassSession } from "@/components/LiveClassSession";
import type {
  AppScreen,
  ClassFact,
  ClassSetup,
  TeacherPersona,
  TranscriptMessage,
  UploadedMaterial
} from "@/lib/types";

const teachers: TeacherPersona[] = [
  {
    id: "new-teacher",
    name: "New Teacher",
    description: "Calm, adaptive, textbook-grounded teaching",
    ageRange: "Built for interactive learning",
    agentId:
      process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_NEW_TEACHER ??
      process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ??
      ""
  }
];

const initialSetup: ClassSetup = {
  className: "",
  subject: "History",
  topicFocus: "",
  materials: [],
  teacherId: teachers[0]?.id ?? "",
  lessonBrief: null
};

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function mapFilesToMaterials(files: File[]): UploadedMaterial[] {
  return files.map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}`,
    name: file.name,
    sizeLabel: formatFileSize(file.size),
    typeLabel: file.type || "application/pdf"
  }));
}

function extractFactsFromTranscript(
  transcript: TranscriptMessage[],
  className: string,
  subject: string,
  materials: UploadedMaterial[]
) {
  const teacherMessages = transcript.filter((message) => message.role === "teacher");
  const studentMessages = transcript.filter((message) => message.role === "student");
  const genericStarts = [
    "hello",
    "welcome",
    "great choice",
    "perfect",
    "i appreciate",
    "does this give you a good overview",
    "[happy]",
    "[excited]",
    "[calm]"
  ];

  const shortTakeaways = teacherMessages
    .map((message) => message.text.replace(/\s+/g, " ").trim())
    .filter((text) => text.length > 0)
    .map((text) => {
      const firstSentence = text.split(/(?<=[.!?])\s+/)[0] ?? text;
      return firstSentence.slice(0, 140).trim();
    })
    .filter((text) => {
      const normalized = text.toLowerCase();
      return !genericStarts.some((prefix) => normalized.startsWith(prefix));
    })
    .filter((text) => text.length > 35)
    .filter((text, index, all) => all.indexOf(text) === index)
    .slice(0, 2);

  const facts: ClassFact[] = [
    {
      id: "fact-subject",
      text: `Subject: ${subject}`
    },
    {
      id: "fact-topic",
      text: `Topic: ${className || "General lesson"}`
    },
    {
      id: "fact-materials",
      text: `Materials: ${materials.length > 0 ? materials.map((item) => item.name).join(", ") : "No uploaded PDFs"}`
    },
    {
      id: "fact-turns",
      text: `Discussion: ${studentMessages.length} student question${studentMessages.length === 1 ? "" : "s"} and ${teacherMessages.length} teacher response${teacherMessages.length === 1 ? "" : "s"}`
    }
  ];

  shortTakeaways.forEach((text, index) => {
    facts.push({
      id: `fact-takeaway-${index + 1}`,
      text: `Takeaway: ${text}`
    });
  });

  return facts;
}

export default function HomePage() {
  const [screen, setScreen] = useState<AppScreen>("setup");
  const [setup, setSetup] = useState<ClassSetup>(initialSetup);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [facts, setFacts] = useState<ClassFact[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [liveWebPullCount, setLiveWebPullCount] = useState(0);

  const selectedTeacher =
    teachers.find((teacher) => teacher.id === setup.teacherId) ?? teachers[0];

  useEffect(() => {
    if (screen !== "live" || isPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setDuration((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [screen, isPaused]);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) {
      return;
    }

    const fileList = Array.from(files);
    const nextMaterials = mapFilesToMaterials(fileList);

    setSetup((current) => ({
      ...current,
      materials: [...current.materials, ...nextMaterials].filter(
        (material, index, all) => all.findIndex((item) => item.id === material.id) === index
      )
    }));

    setSelectedFiles((current) => [
      ...current,
      ...fileList.filter(
        (file, index, all) =>
          all.findIndex(
            (candidate) =>
              candidate.name === file.name &&
              candidate.size === file.size &&
              candidate.lastModified === file.lastModified
          ) === index
      )
    ]);
  };

  const handleStartClass = async () => {
    const trimmedClassName = setup.className.trim();
    const trimmedTopicFocus = setup.topicFocus.trim();

    if (!trimmedClassName) {
      return;
    }

    let lessonBrief: string | null = null;

    if (selectedFiles.length > 0) {
      try {
        const formData = new FormData();

        selectedFiles.forEach((file) => {
          formData.append("files", file);
        });

        const response = await fetch("/api/materials/session", {
          method: "POST",
          body: formData
        });

        if (response.ok) {
          const data = (await response.json()) as { lessonBrief?: string };
          lessonBrief = data.lessonBrief ?? null;
        }
      } catch {
        lessonBrief = null;
      }
    }

    setTranscript([]);
    setFacts([]);
    setConversationId(null);
    setDuration(0);
    setIsMuted(false);
    setIsPaused(false);
    setLiveWebPullCount(0);
    setSetup((current) => ({
      ...current,
      className: trimmedClassName,
      topicFocus: trimmedTopicFocus,
      lessonBrief
    }));
    setScreen("live");
  };

  const handleLiveFilesDropped = async (files: File[]) => {
    const pdfFiles = files.filter((file) => file.type === "application/pdf" || file.name.endsWith(".pdf"));

    if (pdfFiles.length === 0) {
      return;
    }

    const nextMaterials = mapFilesToMaterials(pdfFiles);

    setSetup((current) => ({
      ...current,
      materials: [...current.materials, ...nextMaterials].filter(
        (material, index, all) => all.findIndex((item) => item.id === material.id) === index
      )
    }));

    try {
      const formData = new FormData();
      pdfFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/materials/session", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { lessonBrief?: string };
      const extraBrief = data.lessonBrief?.trim();

      if (!extraBrief) {
        return;
      }

      setSetup((current) => ({
        ...current,
        lessonBrief: current.lessonBrief
          ? `${current.lessonBrief}\n\nAdditional uploaded PDF context:\n${extraBrief}`
          : extraBrief
      }));
    } catch {
      return;
    }
  };

  const handleRestart = () => {
    setScreen("setup");
    setSetup(initialSetup);
    setTranscript([]);
    setFacts([]);
    setConversationId(null);
    setDuration(0);
    setIsMuted(false);
    setIsPaused(false);
    setSelectedFiles([]);
    setLiveWebPullCount(0);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon" aria-hidden="true">
            <span className="block red" />
            <span className="block blue" />
            <span className="block yellow" />
          </div>
          <div>
            <p className="brand-name">NEW TEACHER</p>
          </div>
        </div>

        {screen !== "setup" ? (
          <button className="secondary-button" onClick={handleRestart} type="button">
            Start over
          </button>
        ) : null}
      </header>

      <div className="main-stage">
        {screen === "setup" ? (
          <ClassSetupScreen
            onClassNameChange={(value) =>
              setSetup((current) => ({ ...current, className: value }))
            }
            onFilesSelected={handleFilesSelected}
            onMaterialRemove={(id) => {
              setSetup((current) => ({
                ...current,
                materials: current.materials.filter((material) => material.id !== id)
              }));
              setSelectedFiles((current) =>
                current.filter(
                  (file) => `${file.name}-${file.size}-${file.lastModified}` !== id
                )
              );
            }}
            onStart={() => void handleStartClass()}
            onSubjectChange={(value) => setSetup((current) => ({ ...current, subject: value }))}
            onTopicFocusChange={(value) =>
              setSetup((current) => ({ ...current, topicFocus: value }))
            }
            setup={setup}
          />
        ) : null}

        {screen === "live" && selectedTeacher ? (
          <LiveClassSession
            duration={duration}
            isMuted={isMuted}
            isPaused={isPaused}
            onStop={(endedConversationId) => {
              setConversationId(endedConversationId);
              setFacts(
                extractFactsFromTranscript(
                  transcript,
                  setup.className,
                  setup.subject,
                  setup.materials
                )
              );
              setScreen("summary");
            }}
            onWebSearchUsed={() => setLiveWebPullCount((current) => current + 1)}
            onToggleMute={() => setIsMuted((current) => !current)}
            onTogglePause={() => setIsPaused((current) => !current)}
            onFilesDropped={handleLiveFilesDropped}
            onTranscriptMessage={(message) =>
              setTranscript((current) => [...current, message])
            }
            setup={setup}
            teacher={selectedTeacher}
            transcript={transcript}
          />
        ) : null}

        {screen === "summary" && selectedTeacher ? (
          <ClassSummaryScreen
            conversationId={conversationId}
            duration={duration}
            facts={facts}
            liveWebPullCount={liveWebPullCount}
            onRestart={handleRestart}
            setup={setup}
            teacher={selectedTeacher}
            transcript={transcript}
          />
        ) : null}
      </div>
    </main>
  );
}
