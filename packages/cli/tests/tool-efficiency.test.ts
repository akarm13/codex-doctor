import * as path from "node:path";
import { describe, it, expect } from "vite-plus/test";
import { detectToolInefficiency } from "../src/signals/tool-efficiency.js";
import { parseTranscriptFile } from "../src/parser.js";

const fixture = (name: string) =>
  path.join(import.meta.dirname, "fixtures", name);

describe("detectToolInefficiency", () => {
  it("detects excessive read-to-edit ratio", async () => {
    const events = await parseTranscriptFile(fixture("exploration-heavy-session.jsonl"));
    const signals = detectToolInefficiency(events, "explore-001");
    const explorationSignals = signals.filter(
      (signal) => signal.signalName === "excessive-exploration",
    );
    expect(explorationSignals.length).toBe(1);
    expect(explorationSignals[0].details).toContain("Read-to-edit ratio");
  });

  it("returns no signals for a balanced session", async () => {
    const events = await parseTranscriptFile(fixture("happy-session.jsonl"));
    const signals = detectToolInefficiency(events, "happy-001");
    expect(signals.length).toBe(0);
  });

  it("includes read and edit counts in details", async () => {
    const events = await parseTranscriptFile(fixture("exploration-heavy-session.jsonl"));
    const signals = detectToolInefficiency(events, "explore-001");
    expect(signals[0].details).toMatch(/\d+ reads/);
    expect(signals[0].details).toMatch(/\d+ edits/);
  });
});
