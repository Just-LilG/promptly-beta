import type { Scenario } from "./types";

const mentions = (prompt: string, ...words: string[]) => {
  const p = prompt.toLowerCase();
  return words.some((w) => p.includes(w.toLowerCase()));
};
const wordCount = (prompt: string) => prompt.trim().split(/\s+/).filter(Boolean).length;

// "practice" isn't a domain track. These are quick, general challenges
// pulled from across everyday situations, for the Practice tab's daily drills.
export const practiceScenarios: Scenario[] = [
  {
    slug: "vague-spec",
    trackSlug: "practice",
    title: "Get a straight answer out of a vague spec",
    goal:
      "A coworker asked you to \"make the onboarding flow better.\" You need the AI's help turning this into something actionable, but first, get more out of the vague ask itself.",
    rules: [
      {
        id: "asks-for-specifics",
        label: "Asked what \"better\" actually means in this context",
        test: (p) => mentions(p, "what does better mean", "specifically", "what's wrong", "what problem"),
        weight: 45,
        hintIfMissing:
          "\"Better\" is undefined. Faster? Fewer steps? Higher completion rate? Push for what the actual problem is before jumping to solutions.",
      },
      {
        id: "asks-for-metric",
        label: "Asked what success would look like / how it's measured",
        test: (p) => mentions(p, "success", "measure", "metric", "goal", "kpi"),
        weight: 35,
        hintIfMissing:
          "Without a definition of success, any \"improvement\" is unverifiable. Ask how this would actually be measured.",
      },
      {
        id: "not-jumping-to-solution",
        label: "Didn't jump straight to a solution",
        test: (p) => !mentions(p, "here's how to fix", "you should redesign"),
        weight: 20,
        hintIfMissing:
          "Jumping to a fix before understanding the actual problem risks solving the wrong thing.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const specifics = passed.some((r) => r.id === "asks-for-specifics");
      const metric = passed.some((r) => r.id === "asks-for-metric");
      if (specifics && metric) {
        return "Good questions to ask before touching anything. Once you know whether \"better\" means higher completion rate, fewer support tickets, or faster time-to-first-value, the actual fix could look completely different. Sometimes it's removing a step, sometimes it's adding clarity, sometimes it's not a flow problem at all.";
      }
      return "I could suggest some generic onboarding improvements, but \"better\" could mean five different things here. What's actually failing right now, and how would you know if it improved?";
    },
  },
  {
    slug: "conflicting-instructions",
    trackSlug: "practice",
    title: "Resolve a contradiction before it causes a bad answer",
    goal:
      "You want a summary that's \"brief but covers everything in detail.\" Notice the contradiction and fix it before sending.",
    rules: [
      {
        id: "picks-a-priority",
        label: "Resolved which goal wins (brevity or completeness)",
        test: (p) => mentions(p, "prioritize", "most important", "focus on", "main points only"),
        weight: 50,
        hintIfMissing:
          "\"Brief but comprehensive\" asks for two things in tension. Decide which one actually matters more here and say so.",
      },
      {
        id: "gives-concrete-limit",
        label: "Gave a concrete length instead of \"brief\"",
        test: (p) => mentions(p, "words", "sentences", "bullet", "paragraph"),
        weight: 50,
        hintIfMissing:
          "\"Brief\" is subjective. A specific limit (3 bullets, 100 words) removes the ambiguity entirely.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const priority = passed.some((r) => r.id === "picks-a-priority");
      const limit = passed.some((r) => r.id === "gives-concrete-limit");
      if (priority && limit) {
        return "Clear enough to act on directly. I'll prioritize the main points within that limit rather than silently picking one interpretation of \"brief but detailed\" myself.";
      }
      return "\"Brief but detailed\" pulls in two directions. I'd have to guess which one you actually care about more, and that guess might not match what you need.";
    },
  },
  {
    slug: "sensitive-paste-check",
    trackSlug: "practice",
    title: "Catch a privacy risk before pasting",
    goal:
      "You're about to ask the AI to help debug a config file, but it contains an API key. Handle this correctly before sending anything.",
    context: {
      label: "What you're about to paste",
      content: "API_KEY=sk_live_51Hc8x9J...\nDATABASE_URL=postgres://user:pass@host/db\nDEBUG=true",
    },
    rules: [
      {
        id: "redacts-key",
        label: "Redacted or omitted the actual secret values",
        test: (p) => !mentions(p, "sk_live_51hc8x9j", "user:pass@host"),
        weight: 60,
        hintIfMissing:
          "Never paste real API keys, passwords, or connection strings into a chat. Replace them with placeholders before sharing.",
      },
      {
        id: "explains-issue",
        label: "Still described the actual config issue clearly",
        test: (p) => wordCount(p) > 8,
        weight: 40,
        hintIfMissing:
          "You can still get real help by describing the structure and the problem without including the live secrets themselves.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const redacted = passed.some((r) => r.id === "redacts-key");
      if (redacted) {
        return "Thanks for redacting those. Based on the structure you described, I can still help debug the config without ever seeing the real key or credentials.";
      }
      return "Heads up: that includes a live API key and a database connection string with a password. Redact those before sharing this anywhere, including here. You can replace them with placeholders like [API_KEY] and still get the same help.";
    },
  },
  {
    slug: "verify-confident-claim",
    trackSlug: "practice",
    title: "Question a confident-sounding claim",
    goal:
      "The AI just told you a specific historical date with total confidence. Practice the instinct to verify rather than accept.",
    context: {
      label: "What the AI said",
      content: "\"The Treaty of Westphalia was signed in 1653, ending the Thirty Years' War.\"",
    },
    rules: [
      {
        id: "questions-specifics",
        label: "Questioned the claim rather than accepting it",
        test: (p) => mentions(p, "are you sure", "double check", "verify", "is that right", "confirm"),
        weight: 50,
        hintIfMissing:
          "Confident phrasing isn't the same as accuracy. Practice pausing on specific dates, numbers, and names to double-check them.",
      },
      {
        id: "asks-for-source",
        label: "Asked what this could be verified against",
        test: (p) => mentions(p, "source", "how do you know", "where's that from"),
        weight: 50,
        hintIfMissing:
          "Asking what a claim is based on often reveals whether it's solid or a plausible-sounding guess.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const questioned = passed.some((r) => r.id === "questions-specifics");
      if (questioned) {
        return "Good instinct to check. That date is actually wrong. The Peace of Westphalia was signed in 1648, not 1653. I stated it confidently, but confidence isn't the same as accuracy. Always worth verifying specific dates and figures independently.";
      }
      return "That claim was stated confidently, but fluent phrasing doesn't guarantee correctness. This is exactly the kind of specific, checkable detail worth verifying rather than taking at face value.";
    },
  },
  {
    slug: "restate-lost-context",
    trackSlug: "practice",
    title: "Recognize when context needs restating",
    goal:
      "You're starting a new conversation about a project you discussed yesterday. Handle the fact that the AI doesn't remember it.",
    rules: [
      {
        id: "restates-context",
        label: "Restated the relevant background instead of assuming it carried over",
        test: (p) => wordCount(p) > 20,
        weight: 60,
        hintIfMissing:
          "A new conversation starts from zero. Referencing \"the project we discussed\" without restating what it actually is will get a confused or generic response.",
      },
      {
        id: "not-assuming-memory",
        label: "Didn't phrase it as if the AI should already know",
        test: (p) => !mentions(p, "as we discussed", "like i said before", "you remember"),
        weight: 40,
        hintIfMissing:
          "Phrasing that assumes shared memory (\"as we discussed\") won't work in a new conversation. The AI genuinely doesn't have that context.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const restated = passed.some((r) => r.id === "restates-context");
      if (restated) {
        return "Got it, thanks for the recap. With that context, here's how I'd think about it...";
      }
      return "I don't have any memory of a previous conversation. Each new chat starts fresh. Could you fill me in on the project details so I have something to work with?";
    },
  },
];
