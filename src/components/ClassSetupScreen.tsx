"use client";

import type { ClassSetup, SubjectOption, UploadedMaterial } from "@/lib/types";

type ClassSetupScreenProps = {
  setup: ClassSetup;
  onClassNameChange: (value: string) => void;
  onSubjectChange: (value: SubjectOption) => void;
  onTopicFocusChange: (value: string) => void;
  onFilesSelected: (files: FileList | null) => void;
  onMaterialRemove: (id: string) => void;
  onStart: () => void;
};

const subjectOptions: SubjectOption[] = [
  "History",
  "Science",
  "Math",
  "English",
  "Geography",
  "General"
];

function formatDropzoneLabel(materials: UploadedMaterial[]) {
  if (materials.length === 0) {
    return "Drop textbooks or topic PDFs here, or browse from your computer.";
  }

  if (materials.length === 1) {
    return `${materials[0]?.name} ready for this class.`;
  }

  return `${materials.length} materials ready for this class.`;
}

export function ClassSetupScreen({
  setup,
  onClassNameChange,
  onSubjectChange,
  onTopicFocusChange,
  onFilesSelected,
  onMaterialRemove,
  onStart
}: ClassSetupScreenProps) {
  return (
    <section className="setup-shell">
      <div className="setup-hero simple">
        <h1>Start a class.</h1>
        <p className="setup-copy narrow">
          Give the lesson a name, choose the subject, attach textbook PDFs, and let the teacher take over.
        </p>
      </div>

      <div className="prompt-shell">
        <div className="prompt-meta-row">
          <input
            className="prompt-title-input"
            id="class-name"
            onChange={(event) => onClassNameChange(event.target.value)}
            placeholder="Name this class"
            type="text"
            value={setup.className}
          />

          <select
            className="subject-select"
            id="subject"
            onChange={(event) => onSubjectChange(event.target.value as SubjectOption)}
            value={setup.subject}
          >
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {setup.materials.length > 0 ? (
          <div className="attachment-row">
            {setup.materials.map((material) => (
              <article className="attachment-chip" key={material.id}>
                <div>
                  <p className="material-name">{material.name}</p>
                  <p className="material-meta">
                    {material.typeLabel} • {material.sizeLabel}
                  </p>
                </div>
                <button onClick={() => onMaterialRemove(material.id)} type="button">
                  Remove
                </button>
              </article>
            ))}
          </div>
        ) : null}

        <textarea
          id="topic-focus"
          onChange={(event) => onTopicFocusChange(event.target.value)}
          placeholder="What should the teacher cover? Add chapter goals, difficulty level, or how you want the class taught."
          rows={5}
          value={setup.topicFocus}
        />

        <div className="prompt-toolbar">
          <div className="toolbar-left">
            <label className="toolbar-button" htmlFor="textbook-upload">
              Attach PDFs
              <input
                accept=".pdf"
                id="textbook-upload"
                multiple
                onChange={(event) => onFilesSelected(event.target.files)}
                type="file"
              />
            </label>
            <span className="toolbar-hint">{formatDropzoneLabel(setup.materials)}</span>
          </div>

          <button className="primary-button launch-button" onClick={onStart} type="button">
            Start class
          </button>
        </div>
      </div>
    </section>
  );
}
