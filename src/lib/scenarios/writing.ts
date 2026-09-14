import type { Scenario } from "./types";

const mentions = (prompt: string, ...words: string[]) => {
  const p = prompt.toLowerCase();
  return words.some((w) => p.includes(w.toLowerCase()));
};
const wordCount = (prompt: string) => prompt.trim().split(/\s+/).filter(Boolean).length;

export const writingScenarios: Scenario[] = [
  {
    slug: "match-a-voice",
    trackSlug: "writing",
    title: "Matching a voice instead of writing generic copy",
    goal:
      "You want an email that sounds like you, not like generic AI writing. Give the AI something to imitate.",
    rules: [
      {
        id: "provides-sample",
        label: "Included a sample of the actual voice to match",
        test: (p) => wordCount(p) > 40 || mentions(p, "here's an example", "sample", "like this"),
        weight: 45,
        hintIfMissing:
          "\"Write in my voice\" means nothing without a sample. Paste a paragraph you've actually written and ask the AI to match its rhythm and word choice.",
      },
      {
        id: "names-specific-traits",
        label: "Named specific voice traits (not just \"casual\" or \"professional\")",
        test: (p) => mentions(p, "short sentences", "sentence rhythm", "word choice", "informal", "direct", "wordy", "punchy"),
        weight: 30,
        hintIfMissing:
          "\"Casual\" and \"professional\" are broad categories with huge variation inside them. Name specific traits: short sentences, dry humor, minimal adjectives.",
      },
      {
        id: "states-purpose",
        label: "Stated what the writing needs to accomplish",
        test: (p) => mentions(p, "email", "message", "asking", "requesting", "announce", "purpose"),
        weight: 25,
        hintIfMissing:
          "Voice matching still needs a goal. What is this piece of writing actually trying to do?",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const sample = passed.some((r) => r.id === "provides-sample");
      const traits = passed.some((r) => r.id === "names-specific-traits");
      if (sample && traits) {
        return "Matching that rhythm and tone. Here's a draft that mirrors your sentence length and word choice from the sample: short, direct sentences, no filler adjectives.";
      }
      if (sample) {
        return "I can work from that sample, but the more specific you get about which traits to match (sentence length, formality, humor), the closer this'll land.";
      }
      return "Without a sample of your actual writing, I'll default to a generic version of whatever tone you named, and it won't sound distinctly like you.";
    },
  },
  {
    slug: "audience-calibration",
    trackSlug: "writing",
    title: "Write for a specific audience, not \"everyone\"",
    goal:
      "You're explaining a technical concept in a blog post. Get the AI to actually calibrate complexity to who's reading, not a generic middle ground.",
    rules: [
      {
        id: "names-audience",
        label: "Named a specific audience",
        test: (p) => mentions(p, "beginner", "expert", "non-technical", "executive", "student", "general audience", "professional"),
        weight: 40,
        hintIfMissing:
          "\"Write about X\" without an audience gets a generic middle-ground explanation that under-serves both beginners and experts.",
      },
      {
        id: "names-what-to-avoid",
        label: "Said what to avoid (jargon, assumptions, oversimplification)",
        test: (p) => mentions(p, "avoid jargon", "no jargon", "don't assume", "without assuming", "oversimplify", "too technical"),
        weight: 35,
        hintIfMissing:
          "Naming what to avoid is often more useful than naming the audience alone. \"Avoid assuming they know X\" is concrete and checkable.",
      },
      {
        id: "gives-length-format",
        label: "Specified length or format",
        test: (p) => mentions(p, "words", "paragraphs", "bullet", "short", "long-form", "sentences"),
        weight: 25,
        hintIfMissing:
          "Length signals depth expectations: a 200-word explainer and a 2000-word deep dive need different content, not just different length.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const audience = passed.some((r) => r.id === "names-audience");
      const avoid = passed.some((r) => r.id === "names-what-to-avoid");
      if (audience && avoid) {
        return "Writing this for that audience specifically. I'll build up from first principles without assuming prior knowledge, and skip jargon unless I define it inline first.";
      }
      if (audience) {
        return "Good, I know the audience. Writing at that general level, though tell me if there's specific jargon or assumptions I should explicitly avoid.";
      }
      return "I can write this, but without knowing who it's for, I'll aim for a generic middle ground that may be too basic for experts and too dense for beginners.";
    },
  },
  {
    slug: "edit-preserve-meaning",
    trackSlug: "writing",
    title: "Edit tone without losing what was actually said",
    goal:
      "This message is too blunt for a client email. Get it softened without the AI quietly changing what it says.",
    context: {
      label: "Message to edit",
      content:
        "We can't finish this by Friday. The scope changed twice and the timeline you gave us was never realistic.",
    },
    rules: [
      {
        id: "names-tone-goal",
        label: "Specified the tone to aim for",
        test: (p) => mentions(p, "professional", "diplomatic", "polite", "softer", "less blunt", "tactful"),
        weight: 35,
        hintIfMissing:
          "\"Make this better\" doesn't say what \"better\" means. Name the tone direction (more diplomatic, less blunt, etc.).",
      },
      {
        id: "preserve-content",
        label: "Asked to preserve the actual information",
        test: (p) => mentions(p, "same information", "don't remove", "keep the point", "same message", "without changing what it says", "same facts"),
        weight: 40,
        hintIfMissing:
          "Without this, a tone edit can quietly drop the substance too, e.g. removing \"never realistic\" instead of just softening how it's said. Say the actual claims must stay intact.",
      },
      {
        id: "specific-not-vague",
        label: "Gave more than a one-word instruction",
        test: (p) => wordCount(p) >= 6,
        weight: 25,
        hintIfMissing:
          "\"Fix this\" alone leaves too much interpretation open. A sentence of direction goes a long way.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const tone = passed.some((r) => r.id === "names-tone-goal");
      const preserve = passed.some((r) => r.id === "preserve-content");
      if (tone && preserve) {
        return "Here's a softer version that keeps every point intact: \"We won't be able to finish by Friday. The scope changed twice along the way, and the original timeline didn't account for that. Let's find a revised date that works.\" Same facts, different delivery.";
      }
      if (tone) {
        return "Here's a softer version: \"We're running a bit behind and may need a few more days, happy to discuss a new timeline.\" (Note: I softened this enough that it no longer explains why the delay happened. Let me know if you wanted that reason kept in.)";
      }
      return "I can adjust the tone, but I'm not sure in which direction. More formal? Warmer? Less direct? And should the specific reasons for the delay stay in, or can those be softened too?";
    },
  },
  {
    slug: "structured-long-form",
    trackSlug: "writing",
    title: "Get long-form writing with an actual structure",
    goal:
      "You need a full blog post, not just a topic explored loosely. Give the AI enough structure that it doesn't ramble.",
    rules: [
      {
        id: "provides-outline-or-sections",
        label: "Provided an outline or named sections",
        test: (p) => mentions(p, "sections", "outline", "intro", "conclusion", "headings", "structure"),
        weight: 40,
        hintIfMissing:
          "An unstructured \"write a post about X\" often wanders. Naming sections (intro, 3 main points, conclusion) keeps it organized.",
      },
      {
        id: "states-single-takeaway",
        label: "Stated the single main point/takeaway",
        test: (p) => mentions(p, "main point", "key takeaway", "argument", "thesis", "the point is"),
        weight: 35,
        hintIfMissing:
          "Good long-form writing argues one thing. Without a stated core point, the piece can end up listing ideas rather than building toward something.",
      },
      {
        id: "gives-length",
        label: "Specified a target length",
        test: (p) => mentions(p, "word", "1000", "500", "short", "long"),
        weight: 25,
        hintIfMissing:
          "Length shapes depth and pacing. Say roughly how long this should be.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const outline = passed.some((r) => r.id === "provides-outline-or-sections");
      const point = passed.some((r) => r.id === "states-single-takeaway");
      if (outline && point) {
        return "Writing this around that structure, building every section toward the main point you named so it reads as one argument rather than a loose collection of facts.";
      }
      return "I can write this, but without a structure or a stated main point, I'll be making both calls myself, which may not match the argument you actually want to make.";
    },
  },
  {
    slug: "creative-constraints",
    trackSlug: "writing",
    title: "Give creative writing useful constraints",
    goal:
      "You want a short story, but \"write me a story\" is too open. Add constraints that actually shape something interesting.",
    rules: [
      {
        id: "names-genre-or-tone",
        label: "Named a genre or emotional tone",
        test: (p) => mentions(p, "genre", "mystery", "comedy", "drama", "sad", "hopeful", "tense", "whimsical", "dark"),
        weight: 30,
        hintIfMissing:
          "Genre and tone are the biggest levers in creative writing. Name at least one.",
      },
      {
        id: "names-constraint",
        label: "Added a specific creative constraint",
        test: (p) => mentions(p, "twist", "no dialogue", "first person", "one setting", "in the style of", "under", "exactly"),
        weight: 40,
        hintIfMissing:
          "A concrete constraint (single setting, no dialogue, a required twist) pushes past generic output far more than open-ended freedom does.",
      },
      {
        id: "gives-length",
        label: "Specified length",
        test: (p) => mentions(p, "words", "page", "short", "flash fiction"),
        weight: 30,
        hintIfMissing:
          "Length changes what's even possible in a story: a 200-word piece and a 2000-word piece need completely different pacing.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const genre = passed.some((r) => r.id === "names-genre-or-tone");
      const constraint = passed.some((r) => r.id === "names-constraint");
      if (genre && constraint) {
        return "That constraint gives this real shape. Writing a piece in that tone, built around the constraint you specified. This should feel more distinct than a generic prompt would produce.";
      }
      return "I can write something, but \"a story\" alone leaves enormous room. Without a genre, tone, or constraint, I'll likely land on something fairly generic.";
    },
  },
  {
    slug: "iterate-on-draft",
    trackSlug: "writing",
    title: "Revise a draft without a full rewrite",
    goal:
      "The AI's draft is 80% there. Ask for a revision that changes only what's not working.",
    context: {
      label: "Where you are",
      content:
        "The AI wrote a product description. The structure and length are good, but the opening line is weak and generic.",
    },
    rules: [
      {
        id: "names-what-to-keep",
        label: "Said what to keep",
        test: (p) => mentions(p, "keep", "rest is good", "everything else", "same length", "same structure"),
        weight: 40,
        hintIfMissing:
          "Without this, a revision request can trigger a full rewrite that changes things you were already happy with.",
      },
      {
        id: "names-specific-problem",
        label: "Named the specific problem",
        test: (p) => mentions(p, "opening", "first line", "weak", "generic", "hook"),
        weight: 40,
        hintIfMissing:
          "\"Make it better\" is vague. \"The opening line is weak\" tells the AI exactly where to focus.",
      },
      {
        id: "not-total-rewrite",
        label: "Avoided requesting a full rewrite",
        test: (p) => !mentions(p, "rewrite the whole thing", "start over", "completely different"),
        weight: 20,
        hintIfMissing: "Asking for a complete rewrite throws away the 80% that was already working.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const keep = passed.some((r) => r.id === "names-what-to-keep");
      const problem = passed.some((r) => r.id === "names-specific-problem");
      if (keep && problem) {
        return "Keeping the structure and length as-is, just replacing the opening line with something more specific and less generic. Here's the revised version.";
      }
      return "I can revise it, but tell me: is it just the opening that's weak, or should I look at the whole thing again? I want to avoid changing parts that were already working.";
    },
  },
];
