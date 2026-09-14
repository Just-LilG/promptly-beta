import type { Scenario } from "./types";

const mentions = (prompt: string, ...words: string[]) => {
  const p = prompt.toLowerCase();
  return words.some((w) => p.includes(w.toLowerCase()));
};
const wordCount = (prompt: string) => prompt.trim().split(/\s+/).filter(Boolean).length;

export const automationScenarios: Scenario[] = [
  {
    slug: "delegate-multistep",
    trackSlug: "automation",
    title: "Hand off a multi-step task without losing control",
    goal:
      "You want the AI to complete several steps of a task. Structure it so you stay in control instead of it running ahead unchecked.",
    rules: [
      {
        id: "numbers-steps",
        label: "Broke the task into explicit numbered steps",
        test: (p) => mentions(p, "1.", "2.", "step 1", "first,", "then,"),
        weight: 40,
        hintIfMissing:
          "An unstructured multi-part request can get steps skipped or merged. Numbering the steps keeps the task explicit.",
      },
      {
        id: "requests-checkpoints",
        label: "Asked to pause/show results between steps",
        test: (p) => mentions(p, "before continuing", "show me", "pause", "check with me", "confirm before"),
        weight: 40,
        hintIfMissing:
          "Without a checkpoint, the AI may complete all steps end-to-end even if step 2 went wrong. Ask it to show progress before moving on.",
      },
      {
        id: "defines-ambiguity-handling",
        label: "Said what to do if something is unclear",
        test: (p) => mentions(p, "ask if", "if unclear", "if ambiguous", "let me know if"),
        weight: 20,
        hintIfMissing:
          "Telling the AI to stop and ask rather than guess prevents small misunderstandings from compounding across steps.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const steps = passed.some((r) => r.id === "numbers-steps");
      const checkpoints = passed.some((r) => r.id === "requests-checkpoints");
      if (steps && checkpoints) {
        return "Starting with step 1 now. I'll show you the result and wait for your go-ahead before moving to step 2, rather than running through everything at once.";
      }
      return "I can work through this, but without clear steps or checkpoints, I'll likely complete the whole thing in one pass, which means any misunderstanding early on could carry through the rest.";
    },
  },
  {
    slug: "exact-format-transform",
    trackSlug: "automation",
    title: "Transform data into an exact target format",
    goal:
      "You need messy data converted into a specific structure. Be precise enough that the AI doesn't guess at the shape.",
    context: {
      label: "Sample input",
      content: "John Smith - Sales - Started 2021\nMaria Lopez, Engineering, 2019\nJune Park (Marketing) 2022",
    },
    rules: [
      {
        id: "shows-target-example",
        label: "Showed an example of the target format",
        test: (p) => mentions(p, "example", "like this", "format:", "→"),
        weight: 45,
        hintIfMissing:
          "Describing a format in words is often ambiguous. Show one example row of exactly what you want and the AI can pattern-match from it.",
      },
      {
        id: "handles-inconsistency",
        label: "Acknowledged the input is inconsistently formatted",
        test: (p) => mentions(p, "inconsistent", "different formats", "messy", "not uniform"),
        weight: 30,
        hintIfMissing:
          "Your sample data uses three different formats per row. Flagging that helps the AI normalize rather than choke on the inconsistency.",
      },
      {
        id: "asks-to-flag-unclear",
        label: "Asked unclear rows to be flagged, not guessed",
        test: (p) => mentions(p, "flag", "don't guess", "unclear", "uncertain"),
        weight: 25,
        hintIfMissing:
          "Without this, ambiguous rows may get silently normalized in a way that introduces errors.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const example = passed.some((r) => r.id === "shows-target-example");
      const inconsistency = passed.some((r) => r.id === "handles-inconsistency");
      if (example && inconsistency) {
        return "Converting all three rows to match your example format:\n\nName, Department, Start Year\nJohn Smith, Sales, 2021\nMaria Lopez, Engineering, 2019\nJune Park, Marketing, 2022\n\nAll three normalized cleanly despite the different input formats.";
      }
      return "I can convert this, but without a clear example of your target format, I'm choosing the structure myself, which may not match what you actually need downstream.";
    },
  },
  {
    slug: "recover-stuck-automation",
    trackSlug: "automation",
    title: "Recover when an automated task goes wrong partway through",
    goal:
      "The AI was executing a multi-step task and something broke at step 3. Get it back on track without starting over.",
    context: {
      label: "What happened",
      content:
        "You asked the AI to process a list of 20 items in the same way. It handled items 1-2 fine but got item 3 wrong.",
    },
    rules: [
      {
        id: "identifies-which-step",
        label: "Identified exactly which item/step went wrong",
        test: (p) => mentions(p, "item 3", "step 3", "third one", "that one"),
        weight: 40,
        hintIfMissing:
          "\"That's wrong\" without specifying which item leaves the AI unsure what actually broke.",
      },
      {
        id: "asks-to-not-repeat",
        label: "Asked it not to redo the already-correct items",
        test: (p) => mentions(p, "don't redo", "keep the first", "just fix", "rest were fine"),
        weight: 35,
        hintIfMissing:
          "Without this, asking for a fix might trigger reprocessing everything, including the parts that were already correct.",
      },
      {
        id: "explains-what-wrong",
        label: "Explained what was actually wrong about it",
        test: (p) => mentions(p, "should have", "expected", "instead", "wrong because"),
        weight: 25,
        hintIfMissing:
          "\"That one's wrong\" alone doesn't say why. Explain what the correct result should have looked like.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const which = passed.some((r) => r.id === "identifies-which-step");
      const noRepeat = passed.some((r) => r.id === "asks-to-not-repeat");
      if (which && noRepeat) {
        return "Got it. Keeping items 1 and 2 as they are, fixing just item 3, then continuing with 4 through 20 using the corrected approach.";
      }
      return "I can take another look, but to avoid redoing work that was already correct, tell me specifically which item was wrong and what it should have looked like instead.";
    },
  },
  {
    slug: "tool-use-constraints",
    trackSlug: "automation",
    title: "Give an AI agent clear boundaries when it can use tools",
    goal:
      "You're asking an AI with access to tools (like web search or file access) to complete a task. Set boundaries on what it should and shouldn't do unsupervised.",
    rules: [
      {
        id: "names-allowed-actions",
        label: "Specified what actions are okay to take automatically",
        test: (p) => mentions(p, "can search", "can read", "allowed to", "feel free to"),
        weight: 35,
        hintIfMissing:
          "Being explicit about which tools/actions are fine to use without asking speeds up the task and avoids unnecessary check-ins.",
      },
      {
        id: "names-restricted-actions",
        label: "Specified what needs confirmation before happening",
        test: (p) => mentions(p, "don't", "ask before", "confirm before", "without asking", "never"),
        weight: 45,
        hintIfMissing:
          "For anything irreversible or consequential (sending something, deleting something, spending money), explicitly require confirmation first. Don't assume the AI will pause on its own.",
      },
      {
        id: "gives-scope",
        label: "Scoped the task clearly (what's in bounds, what isn't)",
        test: (p) => wordCount(p) > 15,
        weight: 20,
        hintIfMissing:
          "A narrowly scoped task is easier to hand off safely than an open-ended one. Be specific about what's included.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const restricted = passed.some((r) => r.id === "names-restricted-actions");
      const allowed = passed.some((r) => r.id === "names-allowed-actions");
      if (restricted && allowed) {
        return "Understood. I'll go ahead and use the tools you okayed without checking in each time, but I'll stop and confirm with you before taking any of the actions you flagged as needing approval first.";
      }
      return "I can start on this, but since you haven't specified what needs confirmation first, I'll default to being conservative and check in more than might be strictly necessary. Better to ask than assume on anything irreversible.";
    },
  },
  {
    slug: "validate-automated-output",
    trackSlug: "automation",
    title: "Build in a validation step, don't just trust the output",
    goal:
      "You're having the AI process a batch of data. Ask for a way to verify the result is actually correct before you rely on it.",
    rules: [
      {
        id: "asks-for-spot-check",
        label: "Asked for a way to spot-check the results",
        test: (p) => mentions(p, "spot check", "verify", "sample", "double check", "sanity check"),
        weight: 45,
        hintIfMissing:
          "Batch processing can fail silently on edge cases. Ask for a way to verify a sample rather than trusting the full output blind.",
      },
      {
        id: "asks-for-summary-stats",
        label: "Asked for a summary of what was processed (counts, exceptions)",
        test: (p) => mentions(p, "how many", "count", "summary", "exceptions", "errors"),
        weight: 35,
        hintIfMissing:
          "A count of processed items and flagged exceptions is a fast way to catch a systematic problem without reviewing every row.",
      },
      {
        id: "not-blind-trust",
        label: "Didn't just ask for the output with no verification",
        test: (p) => !(mentions(p, "process this", "convert this") && wordCount(p) < 8),
        weight: 20,
        hintIfMissing:
          "A bare \"process this\" with no verification ask means you'll only find problems after they've already caused downstream issues.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const spotCheck = passed.some((r) => r.id === "asks-for-spot-check");
      const summary = passed.some((r) => r.id === "asks-for-summary-stats");
      if (spotCheck && summary) {
        return "Processed all 40 items: 38 matched the expected pattern cleanly, 2 were flagged as exceptions since they didn't fit the format (shown below for you to check manually). Here's a random sample of 5 processed rows so you can spot-check accuracy before trusting the full batch.";
      }
      return "Done. All items processed. Let me know if you'd like me to flag a sample for you to verify, or report on any that didn't fit the expected pattern cleanly.";
    },
  },
  {
    slug: "reusable-workflow-prompt",
    trackSlug: "automation",
    title: "Design a prompt you'll actually reuse",
    goal:
      "You do this same kind of task weekly. Write a prompt template that works generically, not one tied to this week's specific details.",
    rules: [
      {
        id: "uses-placeholders",
        label: "Used placeholders for the parts that change each time",
        test: (p) => mentions(p, "[", "{", "insert", "placeholder", "variable"),
        weight: 45,
        hintIfMissing:
          "A reusable prompt needs clear placeholders for what changes week to week. Hardcoding this week's specific numbers defeats the purpose of reuse.",
      },
      {
        id: "states-fixed-structure",
        label: "Described the structure that stays constant",
        test: (p) => mentions(p, "every week", "each time", "same format", "always"),
        weight: 35,
        hintIfMissing:
          "Name what stays the same across every use. That's the actual template, distinct from the variable content.",
      },
      {
        id: "not-single-use",
        label: "Avoided baking in this week's specific one-off details",
        test: (p) => !mentions(p, "this week's", "today's specific"),
        weight: 20,
        hintIfMissing:
          "If the prompt only makes sense for this exact instance, it isn't actually reusable. Generalize it.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const placeholders = passed.some((r) => r.id === "uses-placeholders");
      const structure = passed.some((r) => r.id === "states-fixed-structure");
      if (placeholders && structure) {
        return "This is genuinely reusable. Next week you'd just swap out the bracketed values and the rest of the structure holds. Worth saving this one as a template.";
      }
      return "This will work for now, but it's tied to this week's specific details. Next time you'll likely need to rewrite most of it rather than just updating a few values.";
    },
  },
];
