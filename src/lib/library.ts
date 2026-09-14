import type { Icon } from "@/icons";
import { Code, Palette, Pen, MagnifyingGlass, Briefcase, House as HomeIcon, FlowArrow } from "@/icons";

export type PromptTemplate = {
  id: string;
  title: string;
  useCase: string;
  prompt: string;
};

export type LibraryCategory = {
  slug: string;
  name: string;
  icon: Icon;
  templates: PromptTemplate[];
};

export const libraryCategories: LibraryCategory[] = [
  {
    slug: "coding",
    name: "Coding with AI",
    icon: Code,
    templates: [
      {
        id: "bug-report",
        title: "Report a bug with full context",
        useCase: "When something's broken and you want a real diagnosis, not a guess.",
        prompt:
          "I'm getting this error:\n\n[paste exact error message]\n\nHere's the relevant code:\n\n[paste code]\n\nExpected behavior: [what should happen]\nActual behavior: [what actually happens]\n\nWhat's causing this and how do I fix it?",
      },
      {
        id: "code-review",
        title: "Get an honest code review",
        useCase: "Before merging. Asks for real critique, not a rubber stamp.",
        prompt:
          "Review this code critically. I want honest feedback, not reassurance:\n\n[paste code]\n\nSpecifically look for: error handling gaps, edge cases, performance issues, and anything that would break in production. Don't hold back.",
      },
      {
        id: "safe-refactor",
        title: "Refactor without changing behavior",
        useCase: "Cleaning up messy code while guaranteeing nothing else changes.",
        prompt:
          "Refactor this code for readability only. Do not change what it does:\n\n[paste code]\n\nAfter the rewrite, explain what changed and confirm the behavior is identical for every input case.",
      },
      {
        id: "write-tests",
        title: "Generate tests with real edge cases",
        useCase: "Getting test coverage that actually catches bugs.",
        prompt:
          "Write unit tests for this function using [testing framework, e.g. Jest]:\n\n[paste code]\n\nInclude edge cases: empty input, zero, negative numbers, and anything else that could break this.",
      },
      {
        id: "explain-legacy",
        title: "Understand unfamiliar code",
        useCase: "Inheriting code with no context and needing to actually maintain it.",
        prompt:
          "I need to maintain this code but didn't write it:\n\n[paste code]\n\nExplain its purpose in plain language, walk through what each parameter/flag changes about its behavior, and flag anything that looks fragile or unclear.",
      },
    ],
  },
  {
    slug: "design",
    name: "Design with AI",
    icon: Palette,
    templates: [
      {
        id: "style-brief",
        title: "Describe a visual style precisely",
        useCase: "Getting an image/design that actually matches what's in your head.",
        prompt:
          "Create [an image / a mockup] of [subject]. Style: [e.g. minimalist, flat illustration, photorealistic]. Color palette: [colors]. Mood: [e.g. calm, energetic, professional]. Reference: think [comparable brand/artist/style] but [what's different].",
      },
      {
        id: "ui-mockup",
        title: "Request a UI mockup with real constraints",
        useCase: "Asking for an interface design that fits your actual product.",
        prompt:
          "Design a [screen/component name] for a [type of app] targeting [audience]. It needs to include: [list required elements]. Style should match: [existing brand/style reference]. Optimize for [mobile/desktop/both].",
      },
      {
        id: "iterate-design",
        title: "Iterate on a design precisely",
        useCase: "Getting a revision that changes only what you ask, not everything.",
        prompt:
          "Keep everything about this design the same except: [the one specific thing to change]. Don't alter the layout, colors, or other elements unless I ask.",
      },
    ],
  },
  {
    slug: "writing",
    name: "Writing & Content",
    icon: Pen,
    templates: [
      {
        id: "match-voice",
        title: "Match a specific voice or tone",
        useCase: "Getting writing that sounds like you, not generic AI copy.",
        prompt:
          "Here's a sample of my writing style:\n\n[paste 2-3 paragraphs of your own writing]\n\nWrite [content type] about [topic] in this same voice: same sentence rhythm, vocabulary level, and tone.",
      },
      {
        id: "audience-specific",
        title: "Write for a specific audience",
        useCase: "Making sure tone and complexity actually fit who's reading it.",
        prompt:
          "Write [content type] about [topic] for [specific audience, e.g. \"non-technical executives\" or \"beginner hobbyists\"]. Length: [word/character limit]. Avoid: [jargon, assumptions, etc. to skip].",
      },
      {
        id: "edit-tone",
        title: "Edit for tone without losing meaning",
        useCase: "Adjusting how something sounds while keeping the actual content.",
        prompt:
          "Rewrite this to sound more [casual/formal/confident/warm], without changing the actual information or adding new claims:\n\n[paste text]",
      },
    ],
  },
  {
    slug: "research",
    name: "Research & Analysis",
    icon: MagnifyingGlass,
    templates: [
      {
        id: "compare-sources",
        title: "Compare multiple sources fairly",
        useCase: "Getting a structured comparison instead of a vague summary.",
        prompt:
          "Compare these on [specific dimensions, e.g. cost, performance, ease of use]:\n\n1. [option A]\n2. [option B]\n3. [option C]\n\nPresent as a table. Note where sources disagree or information is uncertain.",
      },
      {
        id: "fact-check",
        title: "Ask for a claim to be checked, not assumed",
        useCase: "Reducing confident-sounding wrong answers.",
        prompt:
          "Is this claim accurate: \"[the claim]\"? If you're not certain, say so explicitly rather than giving a confident-sounding guess. Cite what kind of source would confirm this.",
      },
      {
        id: "literature-summary",
        title: "Summarize a document without losing nuance",
        useCase: "Getting a summary that flags disagreement/uncertainty, not a flattened one.",
        prompt:
          "Summarize the key points of this document in [length]. Explicitly note any claims that are uncertain, disputed, or presented as opinion rather than fact:\n\n[paste document or link]",
      },
    ],
  },
  {
    slug: "business",
    name: "Business & Productivity",
    icon: Briefcase,
    templates: [
      {
        id: "meeting-notes",
        title: "Turn raw notes into structured minutes",
        useCase: "Converting messy notes into something a team can actually use.",
        prompt:
          "Turn these raw meeting notes into structured minutes with sections for: Decisions Made, Action Items (with owner if mentioned), and Open Questions:\n\n[paste raw notes]",
      },
      {
        id: "slide-outline",
        title: "Outline a presentation with a clear throughline",
        useCase: "Getting a deck structure that argues something, not just lists facts.",
        prompt:
          "Outline a [number]-slide presentation on [topic] for [audience]. The core argument/takeaway should be: [your main point]. One key idea per slide, with a suggested title for each.",
      },
      {
        id: "data-to-insight",
        title: "Get insight from data, not just description",
        useCase: "Pushing past a restated table toward an actual takeaway.",
        prompt:
          "Here's the data:\n\n[paste data/table]\n\nDon't just describe it back to me. Tell me what's actually notable, what a decision-maker should take away, and what you'd want to verify before acting on it.",
      },
    ],
  },
  {
    slug: "everyday",
    name: "Everyday Life",
    icon: HomeIcon,
    templates: [
      {
        id: "meal-plan",
        title: "Get a meal plan that fits real constraints",
        useCase: "Getting something you'll actually cook, not a generic list.",
        prompt:
          "Plan [number] dinners for the week. Constraints: [dietary restrictions], [time budget per meal], [servings needed], [ingredients to avoid or use up]. Include a combined shopping list.",
      },
      {
        id: "trip-planning",
        title: "Plan a trip around your actual priorities",
        useCase: "Getting an itinerary shaped by what you care about, not a generic top-10 list.",
        prompt:
          "Plan a [length]-day trip to [destination] for [number] people. Priorities: [e.g. food, nature, low-key pace, budget level]. Avoid: [things you don't want, e.g. \"tourist traps\", \"long transit days\"].",
      },
      {
        id: "learn-skill",
        title: "Get a realistic learning plan",
        useCase: "Structuring self-teaching around your actual time and goal.",
        prompt:
          "I want to learn [skill] with about [time available per week]. My goal is [specific outcome, not just \"get better\"]. Give me a realistic plan with milestones, not just a resource list.",
      },
    ],
  },
  {
    slug: "automation",
    name: "Data & Automation",
    icon: FlowArrow,
    templates: [
      {
        id: "multi-step-task",
        title: "Delegate a multi-step task clearly",
        useCase: "Handing off a workflow without ambiguity about what 'done' means.",
        prompt:
          "Complete this task in steps: [describe the overall goal]. Steps:\n1. [step one]\n2. [step two]\n3. [step three]\n\nAfter each step, show me the result before continuing to the next. Stop and ask if anything is ambiguous.",
      },
      {
        id: "data-transform",
        title: "Transform data with an exact target format",
        useCase: "Getting structured output that matches a format you can actually use.",
        prompt:
          "Convert this data:\n\n[paste input data]\n\ninto this exact format: [describe target format, or paste an example row]. Flag any input rows that don't fit the pattern instead of guessing.",
      },
    ],
  },
];
