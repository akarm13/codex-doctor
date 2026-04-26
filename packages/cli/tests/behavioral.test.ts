import * as path from "node:path";
import { describe, it, expect } from "vite-plus/test";
import { detectBehavioralSignals } from "../src/signals/behavioral.js";
import { parseTranscriptFile } from "../src/parser.js";

const fixture = (name: string) =>
  path.join(import.meta.dirname, "fixtures", name);

describe("detectBehavioralSignals", () => {
  describe("correction detection", () => {
    it("detects high correction rate in correction-heavy session", async () => {
      const events = await parseTranscriptFile(fixture("correction-heavy-session.jsonl"));
      const signals = detectBehavioralSignals(events, "correction-001");
      const correctionSignals = signals.filter(
        (signal) => signal.signalName === "correction-heavy",
      );
      expect(correctionSignals.length).toBe(1);
      expect(correctionSignals[0].details).toContain("corrections");
    });

    it("includes correction examples in output", async () => {
      const events = await parseTranscriptFile(fixture("correction-heavy-session.jsonl"));
      const signals = detectBehavioralSignals(events, "correction-001");
      const correctionSignals = signals.filter(
        (signal) => signal.signalName === "correction-heavy",
      );
      expect(correctionSignals[0].examples).toBeDefined();
      expect(correctionSignals[0].examples!.length).toBeGreaterThan(0);
    });

    it("does not flag corrections in a happy session", async () => {
      const events = await parseTranscriptFile(fixture("happy-session.jsonl"));
      const signals = detectBehavioralSignals(events, "happy-001");
      const correctionSignals = signals.filter(
        (signal) => signal.signalName === "correction-heavy",
      );
      expect(correctionSignals.length).toBe(0);
    });
  });

  describe("keep-going loop detection", () => {
    it("detects keep-going patterns", async () => {
      const events = await parseTranscriptFile(fixture("keep-going-session.jsonl"));
      const signals = detectBehavioralSignals(events, "keep-going-001");
      const keepGoingSignals = signals.filter(
        (signal) => signal.signalName === "keep-going-loop",
      );
      expect(keepGoingSignals.length).toBe(1);
      expect(keepGoingSignals[0].details).toContain("keep going");
    });

    it("does not flag sessions without keep-going", async () => {
      const events = await parseTranscriptFile(fixture("happy-session.jsonl"));
      const signals = detectBehavioralSignals(events, "happy-001");
      const keepGoingSignals = signals.filter(
        (signal) => signal.signalName === "keep-going-loop",
      );
      expect(keepGoingSignals.length).toBe(0);
    });
  });

  describe("sentiment drift detection", () => {
    it("detects negative drift in degrading session", async () => {
      const events = await parseTranscriptFile(fixture("drift-session.jsonl"));
      const signals = detectBehavioralSignals(events, "drift-001");
      const driftSignals = signals.filter(
        (signal) => signal.signalName === "negative-drift",
      );
      expect(driftSignals.length).toBe(1);
      expect(driftSignals[0].details).toContain("shorter");
    });

    it("does not detect drift in happy session", async () => {
      const events = await parseTranscriptFile(fixture("happy-session.jsonl"));
      const signals = detectBehavioralSignals(events, "happy-001");
      const driftSignals = signals.filter(
        (signal) => signal.signalName === "negative-drift",
      );
      expect(driftSignals.length).toBe(0);
    });
  });

  describe("rapid correction detection", () => {
    it("detects rapid follow-ups within 10 seconds", async () => {
      const events = await parseTranscriptFile(fixture("rapid-correction-session.jsonl"));
      const signals = detectBehavioralSignals(events, "rapid-001");
      const rapidSignals = signals.filter(
        (signal) => signal.signalName === "rapid-corrections",
      );
      expect(rapidSignals.length).toBe(1);
      expect(rapidSignals[0].details).toContain("within 10 seconds");
    });

    it("does not flag sessions with normal response timing", async () => {
      const events = await parseTranscriptFile(fixture("drift-session.jsonl"));
      const signals = detectBehavioralSignals(events, "drift-001");
      const rapidSignals = signals.filter(
        (signal) => signal.signalName === "rapid-corrections",
      );
      expect(rapidSignals.length).toBe(0);
    });
  });

  describe("happy path", () => {
    it("returns no behavioral signals for a clean session", async () => {
      const events = await parseTranscriptFile(fixture("happy-session.jsonl"));
      const signals = detectBehavioralSignals(events, "happy-001");
      expect(signals.length).toBe(0);
    });

    it("returns empty for meta-only session", async () => {
      const events = await parseTranscriptFile(fixture("meta-only-session.jsonl"));
      const signals = detectBehavioralSignals(events, "meta-001");
      expect(signals.length).toBe(0);
    });
  });

  describe("combined signals", () => {
    it("can produce multiple signal types from one session", async () => {
      const events = await parseTranscriptFile(fixture("drift-session.jsonl"));
      const signals = detectBehavioralSignals(events, "drift-001");
      const signalNames = new Set(
        signals.map((signal) => signal.signalName),
      );
      expect(signalNames.size).toBeGreaterThanOrEqual(2);
    });

    it("frustrated session triggers behavioral signals too", async () => {
      const events = await parseTranscriptFile(fixture("frustrated-session.jsonl"));
      const signals = detectBehavioralSignals(events, "frustrated-001");
      expect(signals.length).toBeGreaterThan(0);
    });
  });
});
