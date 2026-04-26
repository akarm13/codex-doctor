import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { CODEX_SESSIONS_DIR } from "./constants.js";
import {
  parseHistoryFile,
  extractUserMessages,
  countInterrupts,
  getSessionTimeRange,
} from "./parser.js";

export const HISTORY_FILENAME = "history.jsonl";

export const getHistoryFilePath = (): string =>
  path.join(os.homedir(), CODEX_SESSIONS_DIR, HISTORY_FILENAME);

export const indexAllProjects = async (
  _projectFilter?: string,
): Promise<ProjectMetadata[]> => {
  const historyPath = getHistoryFilePath();
  if (!fs.existsSync(historyPath)) return [];

  const sessionMap = await parseHistoryFile(historyPath);
  if (sessionMap.size === 0) return [];

  const sessions: SessionMetadata[] = [];

  for (const [sessionId, events] of sessionMap) {
    const userMessages = extractUserMessages(events);
    const interruptCount = countInterrupts(events);
    const { start, end } = getSessionTimeRange(events);

    sessions.push({
      sessionId,
      projectPath: ".codex",
      projectName: ".codex",
      filePath: historyPath,
      events,
      startTime: start,
      endTime: end,
      userMessageCount: userMessages.length,
      assistantMessageCount: 0,
      toolCallCount: 0,
      toolErrorCount: 0,
      interruptCount,
    });
  }

  sessions.sort(
    (left, right) => left.startTime.getTime() - right.startTime.getTime(),
  );

  return [
    {
      projectPath: ".codex",
      projectName: ".codex",
      sessions,
      totalSessions: sessions.length,
    },
  ];
};
