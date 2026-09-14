import type { Scenario } from "./types";

const mentions = (prompt: string, ...words: string[]) => {
  const p = prompt.toLowerCase();
  return words.some((w) => p.includes(w.toLowerCase()));
};
const wordCount = (prompt: string) => prompt.trim().split(/\s+/).filter(Boolean).length;

export const researchScenarios: Scenario[] = [
  {
    slug: "avoid-confident-guess",
    trackSlug: "research",
    title: "Ask without inviting a confident guess",
    goal:
      "You're not sure if a claim is true. Write a prompt that gets an honest answer instead of a fluent-sounding guess.",
    context: {
      label: "The claim you're checking",
      content: "\"Reading in dim light permanently damages your eyesight.\"",
    },
    rules: [
      {
        id: "asks-for-certainty",
        label: "Asked how certain the AI actually is",
        test: (p) => mentions(p, "certain", "confidence", "how sure", "sure about this", "actually true"),
        weight: 40,
        hintIfMissing:
          "Directly asking for a confidence level pushes past a fluent-sounding default answer toward an honest one.",
      },
      {
        id: "asks-for-source-type",
        label: "Asked what kind of source would confirm this",
        test: (p) => mentions(p, "source", "study", "evidence", "citation", "research"),
        weight: 35,
        hintIfMissing:
          "Asking what would actually verify a claim (a specific study, expert consensus) is more useful than asking \"is this true\" alone.",
      },
      {
        id: "not-leading",
        label: "Avoided phrasing that leads toward one answer",
        test: (p) => !mentions(p, "right that", "isn't it true", "confirm that"),
        weight: 25,
        hintIfMissing:
          "\"Isn't it true that...\" nudges toward agreement. Neutral phrasing gets a more honest answer.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const certainty = passed.some((r) => r.id === "asks-for-certainty");
      const source = passed.some((r) => r.id === "asks-for-source-type");
      if (certainty && source) {
        return "That's actually a common myth. Reading in dim light can cause temporary eye strain and fatigue, but there's no good evidence it causes permanent damage. I'd put my confidence in that at fairly high, based on consistent findings across ophthalmology sources, though I'd point you to a source like the American Academy of Ophthalmology for a definitive answer rather than taking my word for it.";
      }
      return "That claim is often repeated, but I'd want to flag: I'm not fully certain of the underlying evidence here without more specifics. Want me to break down what's actually established vs. commonly assumed?";
    },
  },
  {
    slug: "structured-comparison",
    trackSlug: "research",
    title: "Get a structured comparison, not a vague summary",
    goal:
      "You're deciding between three options and need a real comparison, not a wall of text that vaguely favors one.",
    rules: [
      {
        id: "names-dimensions",
        label: "Named specific comparison dimensions",
        test: (p) => mentions(p, "cost", "price", "performance", "ease of use", "speed", "quality", "compare on"),
        weight: 40,
        hintIfMissing:
          "\"Compare these\" without dimensions gets whatever the AI finds most salient. Name what actually matters to your decision.",
      },
      {
        id: "requests-format",
        label: "Requested a specific format (table, list)",
        test: (p) => mentions(p, "table", "list", "side by side", "bullet"),
        weight: 30,
        hintIfMissing:
          "A table or structured list is much easier to actually use for a decision than a paragraph comparing three things at once.",
      },
      {
        id: "asks-for-disagreement",
        label: "Asked to flag uncertainty or disagreement between sources",
        test: (p) => mentions(p, "uncertain", "disagree", "unclear", "conflicting", "not sure"),
        weight: 30,
        hintIfMissing:
          "Real comparisons often have unclear or contested points. Ask for those to be flagged rather than smoothed over.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const dimensions = passed.some((r) => r.id === "names-dimensions");
      const format = passed.some((r) => r.id === "requests-format");
      if (dimensions && format) {
        return "Here's a comparison table across the dimensions you named. I've marked one row where information conflicts across sources, so you can dig into that specifically before deciding.";
      }
      return "I can compare these, but without knowing which dimensions matter most to you, I might emphasize things that aren't actually relevant to your decision.";
    },
  },
  {
    slug: "summarize-without-flattening",
    trackSlug: "research",
    title: "Summarize a document without losing nuance",
    goal:
      "You need a summary of a long report, but summaries often flatten disagreement or turn opinions into stated facts. Prevent that.",
    rules: [
      {
        id: "asks-to-flag-opinion",
        label: "Asked to distinguish fact from opinion/interpretation",
        test: (p) => mentions(p, "opinion", "fact", "interpretation", "claim", "objective"),
        weight: 40,
        hintIfMissing:
          "A summary can quietly present the author's opinions as settled facts. Ask explicitly for that distinction to be preserved.",
      },
      {
        id: "asks-to-flag-uncertainty",
        label: "Asked uncertain/disputed points to be flagged",
        test: (p) => mentions(p, "uncertain", "disputed", "unclear", "debated", "not settled"),
        weight: 35,
        hintIfMissing:
          "Summaries tend to smooth over hedged or disputed claims into confident statements. Explicitly ask for those to stay marked as uncertain.",
      },
      {
        id: "gives-length",
        label: "Specified summary length",
        test: (p) => mentions(p, "words", "sentences", "paragraph", "bullet", "short", "brief"),
        weight: 25,
        hintIfMissing:
          "An unspecified length leaves the AI to guess how much detail to keep. Say roughly how long you want it.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const opinion = passed.some((r) => r.id === "asks-to-flag-opinion");
      const uncertainty = passed.some((r) => r.id === "asks-to-flag-uncertainty");
      if (opinion && uncertainty) {
        return "Here's the summary, with the author's interpretive claims marked separately from the report's factual findings, and one section flagged where the data itself is described as preliminary rather than conclusive.";
      }
      return "Here's a summary of the main points. Note: I've presented this fairly plainly. If you want me to separate out what's stated as fact vs. the author's own interpretation, let me know and I'll redo it with that distinction.";
    },
  },
  {
    slug: "verify-before-trusting",
    trackSlug: "research",
    title: "Push past a fluent-sounding wrong answer",
    goal:
      "The AI gave you a confident-sounding answer earlier that you're not sure is right. Write a follow-up that actually tests it.",
    context: {
      label: "What happened",
      content:
        "You asked the AI a factual question and got a specific, confident answer with a number in it. Something about it feels off.",
    },
    rules: [
      {
        id: "asks-to-double-check",
        label: "Asked the AI to re-examine its own answer",
        test: (p) => mentions(p, "double-check", "re-check", "are you sure", "verify", "double check"),
        weight: 40,
        hintIfMissing:
          "Directly asking the AI to re-examine its own claim often surfaces hedges or corrections that weren't volunteered the first time.",
      },
      {
        id: "asks-for-reasoning",
        label: "Asked how it arrived at that specific number/fact",
        test: (p) => mentions(p, "how did you", "where did that come from", "based on what", "reasoning"),
        weight: 35,
        hintIfMissing:
          "Asking for the reasoning behind a specific claim often reveals whether it's a solid fact or an unsupported guess dressed up confidently.",
      },
      {
        id: "states-suspicion",
        label: "Stated what feels off about it",
        test: (p) => mentions(p, "seems off", "doesn't sound right", "not sure that's right", "suspicious"),
        weight: 25,
        hintIfMissing:
          "Naming your specific doubt focuses the recheck. A vague \"is this right?\" is less useful than \"that number seems too high, is it?\"",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const doubleCheck = passed.some((r) => r.id === "asks-to-double-check");
      const reasoning = passed.some((r) => r.id === "asks-for-reasoning");
      if (doubleCheck && reasoning) {
        return "Good catch to double-check. On reflection, that specific figure isn't something I can verify with confidence. I likely generated a plausible-sounding number rather than recalling a verified one. I'd recommend checking a primary source for the exact figure rather than relying on that answer.";
      }
      return "I gave you an answer with confidence, but if something feels off, it's worth asking me to re-examine it specifically. Confident phrasing isn't the same as verified accuracy.";
    },
  },
  {
    slug: "extract-data-insight",
    trackSlug: "research",
    title: "Get insight from data, not a restatement of it",
    goal:
      "You have a dataset and want an actual analysis, not just the AI describing the numbers back to you.",
    rules: [
      {
        id: "asks-for-takeaway",
        label: "Asked for the takeaway, not just a description",
        test: (p) => mentions(p, "takeaway", "insight", "what does this mean", "what should i", "notable"),
        weight: 45,
        hintIfMissing:
          "\"Analyze this data\" alone often just gets the data restated in sentence form. Ask explicitly for the takeaway or what's notable.",
      },
      {
        id: "asks-to-verify-before-acting",
        label: "Asked what to verify before acting on the finding",
        test: (p) => mentions(p, "verify", "before i act", "double check", "confirm before"),
        weight: 35,
        hintIfMissing:
          "A good analysis flags its own uncertainty. Asking what to verify first prevents acting on a shaky pattern.",
      },
      {
        id: "provides-context",
        label: "Gave context about what the data represents",
        test: (p) => wordCount(p) > 15,
        weight: 20,
        hintIfMissing:
          "Raw numbers without context (what they measure, over what period, from what source) limit how useful any analysis can be.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const takeaway = passed.some((r) => r.id === "asks-for-takeaway");
      const verify = passed.some((r) => r.id === "asks-to-verify-before-acting");
      if (takeaway && verify) {
        return "The clearest pattern here is a sharp increase in one segment relative to the others. Worth investigating whether that's a genuine trend or a one-off. Before acting on it, I'd verify whether the underlying data collection method changed around that same point, since that's a common cause of a sudden jump that isn't real.";
      }
      return "Looking at the numbers, there's a clear increase in one segment relative to the others. Let me know if you want me to dig into whether that's likely a real trend or something worth double-checking first.";
    },
  },
  {
    slug: "literature-review-scope",
    trackSlug: "research",
    title: "Scope a literature review so it's actually useful",
    goal:
      "You want an overview of research on a topic. Give the AI enough scope that it doesn't produce something too broad to act on.",
    rules: [
      {
        id: "narrows-scope",
        label: "Narrowed the topic to something specific",
        test: (p) => wordCount(p) > 12,
        weight: 35,
        hintIfMissing:
          "A broad topic (\"research on sleep\") produces a broad, shallow overview. Narrow it: a specific question, population, or angle.",
      },
      {
        id: "specifies-recency",
        label: "Specified a time range or recency requirement",
        test: (p) => mentions(p, "recent", "last five years", "last decade", "current", "up to date"),
        weight: 30,
        hintIfMissing:
          "Fields move. Specify whether you want recent findings or a broader historical view.",
      },
      {
        id: "asks-for-consensus-vs-debate",
        label: "Asked what's settled vs. still debated",
        test: (p) => mentions(p, "consensus", "debate", "agreement", "still debated", "settled"),
        weight: 35,
        hintIfMissing:
          "Distinguishing consensus from active debate is often the most useful thing an overview can tell you. Ask for it explicitly.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const scope = passed.some((r) => r.id === "narrows-scope");
      const consensus = passed.some((r) => r.id === "asks-for-consensus-vs-debate");
      if (scope && consensus) {
        return "On that narrower question, there's reasonably strong consensus on the core finding, but active debate remains on the mechanism behind it. Worth knowing which part you're relying on before citing this anywhere.";
      }
      return "I can give you an overview, but a broad topic like this will produce a broad, shallow summary. Narrowing the question and asking what's settled vs. still debated will get you something far more usable.";
    },
  },
];
