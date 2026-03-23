import type { WebSource } from "@/lib/types";

type ConversationRecord = {
  searchCount: number;
  sources: WebSource[];
};

const globalStore = globalThis as typeof globalThis & {
  newTeacherConversationStore?: Map<string, ConversationRecord>;
};

const conversationStore =
  globalStore.newTeacherConversationStore ??
  (globalStore.newTeacherConversationStore = new Map<string, ConversationRecord>());

function getOrCreateConversationRecord(conversationId: string) {
  const existing = conversationStore.get(conversationId);

  if (existing) {
    return existing;
  }

  const created = { searchCount: 0, sources: [] };
  conversationStore.set(conversationId, created);
  return created;
}

export function recordConversationSources(conversationId: string, sources: WebSource[]) {
  const record = getOrCreateConversationRecord(conversationId);
  record.searchCount += 1;

  const merged = [...record.sources];

  for (const source of sources) {
    if (!source.url || merged.some((item) => item.url === source.url)) {
      continue;
    }

    merged.push(source);
  }

  record.sources = merged.slice(0, 12);
}

export function getConversationSummary(conversationId: string) {
  const record = conversationStore.get(conversationId);

  return {
    searchCount: record?.searchCount ?? 0,
    sources: record?.sources ?? []
  };
}
