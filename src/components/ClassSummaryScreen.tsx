"use client";

import { useEffect, useState } from "react";
import type { ClassFact, ClassSetup, TeacherPersona, TranscriptMessage, WebSource } from "@/lib/types";

type ClassSummaryResponse = {
  searchCount: number;
  sources: WebSource[];
};

type ClassSummaryScreenProps = {
  setup: ClassSetup;
  teacher: TeacherPersona;
  transcript: TranscriptMessage[];
  duration: number;
  conversationId: string | null;
  facts: ClassFact[];
  liveWebPullCount: number;
  onRestart: () => void;
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

export function ClassSummaryScreen({
  setup,
  teacher,
  transcript,
  duration,
  conversationId,
  facts,
  liveWebPullCount,
  onRestart
}: ClassSummaryScreenProps) {
  const [searchCount, setSearchCount] = useState(0);
  const [sources, setSources] = useState<WebSource[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setSearchCount(0);
      setSources([]);
      return;
    }

    let cancelled = false;

    const loadSummary = async () => {
      const response = await fetch(`/api/classes/${conversationId}/summary`, { cache: "no-store" });

      if (!response.ok || cancelled) {
        return;
      }

      const data = (await response.json()) as ClassSummaryResponse;

      if (cancelled) {
        return;
      }

      setSearchCount(Math.max(data.searchCount, liveWebPullCount));
      setSources(data.sources);
    };

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, [conversationId, liveWebPullCount]);

  const handleSaveClass = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/classes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          className: setup.className,
          subject: setup.subject,
          topicFocus: setup.topicFocus,
          teacher: teacher.name,
          duration,
          transcript,
          facts,
          sources,
          conversationId
        })
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      setSaveMessage("Class saved locally.");
    } catch {
      setSaveMessage("Could not save the class.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="screen-card summary-card">
      <div className="card-topline">
        <div>
          <p className="section-label">Class summary</p>
          <h2>{setup.className}</h2>
        </div>
        <button className="secondary-button" onClick={onRestart} type="button">
          New class
        </button>
      </div>

      <div className="summary-overview-grid">
        <article className="overview-tile">
          <p className="minor-label">Session</p>
          <p className="overview-number">{formatTime(duration)}</p>
          <span>
            {setup.subject} with {teacher.name}
          </span>
        </article>

        <article className="overview-tile">
          <p className="minor-label">Materials</p>
          <p className="overview-number">{setup.materials.length}</p>
          <span>{setup.materials.map((item) => item.name).join(", ") || "No PDFs uploaded"}</span>
        </article>

        <article className="overview-tile">
          <p className="minor-label">Live web pulls</p>
          <p className="overview-number">{Math.max(searchCount, liveWebPullCount)}</p>
          <span>Firecrawl-assisted context used during the lesson</span>
        </article>
      </div>

      <div className="summary-grid">
        <section className="summary-panel">
          <p className="minor-label">Key facts</p>
          <div className="fact-list">
            {facts.length > 0 ? (
              facts.map((fact) => <p key={fact.id}>{fact.text}</p>)
            ) : (
              <p>No summary facts were generated from the transcript yet.</p>
            )}
          </div>
        </section>

        <section className="summary-panel">
          <p className="minor-label">Sources</p>
          <div className="source-list">
            {setup.materials.map((material) => (
              <article className="source-item" key={material.id}>
                <p>{material.name}</p>
                <span>Uploaded class material</span>
              </article>
            ))}
            {sources.map((source) => (
              <article className="source-item" key={source.url}>
                <a href={source.url} rel="noreferrer" target="_blank">
                  {source.title}
                </a>
                <span>{source.content}</span>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="summary-panel transcript-summary">
        <p className="minor-label">Transcript</p>
        <div className="transcript-preview-list">
          {transcript.map((message) => (
            <p key={message.id}>
              <strong>{message.label}:</strong> {message.text}
            </p>
          ))}
        </div>
      </section>

      <div className="summary-actions">
        <button
          className="primary-button"
          disabled={isSaving}
          onClick={() => void handleSaveClass()}
          type="button"
        >
          {isSaving ? "Saving..." : "Save class"}
        </button>
        {saveMessage ? <p className="save-message">{saveMessage}</p> : null}
      </div>
    </section>
  );
}
