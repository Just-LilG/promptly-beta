const SEEN_KEY = "promptly:learn-seen";

export function getSeenLearnSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function markLearnLessonSeen(slug: string) {
  if (typeof window === "undefined") return;
  const next = new Set(getSeenLearnSlugs());
  next.add(slug);
  localStorage.setItem(SEEN_KEY, JSON.stringify([...next]));
}

export type LearnLesson = {
  slug: string;
  title: string;
  summary: string;
  explanation: string;
  badExample: string;
  goodExample: string;
  whyItWorks: string;
};

export const learnLessons: LearnLesson[] = [
  {
    slug: "specificity",
    title: "Being specific",
    summary: "Vague prompts get vague answers. Specificity is the single biggest lever you have.",
    explanation:
      "An AI can't read your mind. When a request is vague, it has to fill in the gaps with assumptions, and those assumptions are often generic, because the AI is optimizing for \"plausible for anyone,\" not \"right for you.\" The fix is almost always the same: say exactly what you want, for whom, and in what form.",
    badExample: "Write me a bio.",
    goodExample:
      "Write a 3-sentence professional bio for my LinkedIn, for a mid-career UX designer moving into product management. Confident but not boastful.",
    whyItWorks:
      "The good version specifies length, platform, career context, and tone: four things the AI would otherwise have to guess, and probably guess wrong for your actual situation.",
  },
  {
    slug: "context",
    title: "Giving context",
    summary: "The AI only knows what's in front of it. Nothing else, no matter how obvious it seems to you.",
    explanation:
      "A new conversation starts from zero. If something matters (your industry, your constraints, a decision you already made, a document you're referencing) it has to be stated, not implied. The most common failure isn't a bad question, it's a question missing the one piece of context that would have changed the answer.",
    badExample: "Is this a good price?",
    goodExample:
      "I'm looking at a 2019 Honda Civic with 60,000 miles for $16,500 in the US. Is that a fair price, and what should I check before buying?",
    whyItWorks:
      "Without the car, mileage, price, and location, there's no way to answer the question at all. The AI would have to ask for all of this back, costing you a round trip.",
  },
  {
    slug: "role-prompting",
    title: "Role prompting",
    summary: "Telling the AI who to be shapes vocabulary, depth, and tone. It is not a magic word.",
    explanation:
      "\"Act as a senior copywriter\" or \"respond as a patient teacher\" can genuinely shift the style and depth of a response. It works because it gives the model a consistent frame to write from. But a role alone doesn't replace specifics. Pairing a role with a real audience and goal works far better than the role alone.",
    badExample: "Act as an expert and explain blockchain.",
    goodExample:
      "Act as a teacher explaining to a curious 12-year-old: what is blockchain, using an analogy they'd actually understand?",
    whyItWorks:
      "The role plus the audience together do real work. \"Expert\" alone doesn't tell the AI how deep or simple to go, but \"explaining to a 12-year-old\" does.",
  },
  {
    slug: "constraints",
    title: "Constraints",
    summary: "Length, format, and boundaries turn an open-ended request into something usable on the first try.",
    explanation:
      "Without constraints, you're accepting whatever length and shape the AI defaults to, which is often longer and more hedge-y than you need. Naming a length limit, a format (bullets vs. prose), or a boundary (\"don't include X\") up front saves a revision round almost every time.",
    badExample: "Summarize this article.",
    goodExample:
      "Summarize this article in 3 bullet points, each under 15 words, focused only on the financial impact. Skip the background context.",
    whyItWorks:
      "Every constraint here (count, length, focus, exclusion) removes a decision the AI would otherwise make for you, often not the decision you'd have made yourself.",
  },
  {
    slug: "iteration",
    title: "Iteration",
    summary: "The first answer is a draft, not a verdict. Treat it that way.",
    explanation:
      "A common mistake is either accepting a mediocre first answer, or discarding it and starting over with a whole new prompt. Both waste the AI's work. The better move is almost always a short, direct follow-up: \"shorter,\" \"more casual,\" \"keep the structure but change the ending.\" Models are much better at editing toward a target than guessing it cold.",
    badExample: "[Gets a response that's too long] then retypes the entire original prompt from scratch, hoping for something shorter this time.",
    goodExample: "That's close. Cut it to half the length and drop the closing paragraph.",
    whyItWorks:
      "A direct edit request builds on what already worked, rather than throwing it away and rolling the dice on a fresh generation.",
  },
  {
    slug: "few-shot",
    title: "Few-shot examples",
    summary: "Showing an example is often more effective than describing what you want in words.",
    explanation:
      "Some things are hard to describe but easy to demonstrate: a tone, a format, a level of detail. Providing one or two examples of exactly what \"good\" looks like (\"format it like this: ...\") lets the AI pattern-match instead of guess at your description.",
    badExample: "Write product descriptions in a punchy, fun tone.",
    goodExample:
      "Write product descriptions in this tone. Example: \"This mug doesn't just hold coffee. It holds your entire morning together.\" Now write one for a desk lamp in the same style.",
    whyItWorks:
      "\"Punchy and fun\" is subjective and could mean many different things. A concrete example removes that ambiguity entirely.",
  },
  {
    slug: "chain-of-thought",
    title: "Asking for reasoning",
    summary: "For anything with multiple steps or trade-offs, asking the AI to reason out loud improves the answer.",
    explanation:
      "Asking a model to \"think step by step\" or \"show your reasoning before the final answer\" tends to produce more accurate, more carefully considered results for anything involving logic, math, or weighing options, because it isn't jumping straight to a plausible-sounding conclusion.",
    badExample: "Which of these two vendors should I pick?",
    goodExample:
      "Walk through the trade-offs between these two vendors step by step (cost, reliability, support) before giving a final recommendation.",
    whyItWorks:
      "Asking for the reasoning first means the final recommendation is actually built on stated trade-offs you can check, rather than a conclusion that skipped the work.",
  },
];
