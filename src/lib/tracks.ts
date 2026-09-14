import { Code, Palette, Pen, MagnifyingGlass, Briefcase, House as HomeIcon, FlowArrow } from "@/icons";
import type { Icon } from "@/icons";

export type Track = {
  slug: string;
  name: string;
  blurb: string;
  intro: string;
  icon: Icon;
  lessons: number;
};

export const tracks: Track[] = [
  {
    slug: "coding",
    name: "Coding with AI",
    blurb: "Debugging, reviews, and specs an AI won't misread.",
    intro:
      "Prompting for code fails differently than prompting for prose. The AI can't see your terminal, your stack trace, or your file tree. If you don't paste it, it's guessing. This track is built around the habits that close that gap: sharing the actual code and error, stating expected vs. actual behavior, and being explicit about your stack.",
    icon: Code,
    lessons: 8,
  },
  {
    slug: "design",
    name: "Design with AI",
    blurb: "Describe a look precisely enough to get it back.",
    intro:
      "\"Make it look nice\" means nothing to an AI. Style, mood, color, and composition all need to be stated, not implied. This track builds the habit of describing visuals precisely enough to get back what's actually in your head, and iterating on a design without losing the parts that already worked.",
    icon: Palette,
    lessons: 7,
  },
  {
    slug: "writing",
    name: "Writing & Content",
    blurb: "Tone, voice, and audience control.",
    intro:
      "Generic prompts produce generic writing. This track focuses on giving the AI something concrete to work from: a voice sample to match, a specific audience to write for, a clear structure to follow. Then what comes back actually sounds like it was written for your situation, not a template.",
    icon: Pen,
    lessons: 6,
  },
  {
    slug: "research",
    name: "Research & Analysis",
    blurb: "Ask without inviting a confident guess.",
    intro:
      "AI can sound equally confident whether it's right or wrong. This track is about asking in ways that surface real uncertainty instead of masking it: structured comparisons, catching flattened nuance in summaries, and pushing past fluent-sounding answers toward ones you can actually verify.",
    icon: MagnifyingGlass,
    lessons: 6,
  },
  {
    slug: "business",
    name: "Business & Productivity",
    blurb: "Structured output your team can actually use.",
    intro:
      "Business use of AI usually needs to produce something specific: minutes with owners, a deck with an argument, data in an exact format. This track is about giving enough structure and constraint that the first draft is usable, not something you have to substantially rework before anyone else sees it.",
    icon: Briefcase,
    lessons: 7,
  },
  {
    slug: "everyday",
    name: "Everyday Life",
    blurb: "Meal plans, travel, and the small daily stuff.",
    intro:
      "Not every prompt needs heavy engineering. The ones that matter (meal plans, trip planning, personal decisions) go from generic to genuinely useful once you add your real constraints. This track also covers knowing when a quick, simple prompt is actually the right call.",
    icon: HomeIcon,
    lessons: 5,
  },
  {
    slug: "automation",
    name: "Data & Automation",
    blurb: "Hand off multi-step work without losing control.",
    intro:
      "Delegating a multi-step task to AI means staying in control of it: clear steps, checkpoints, and validation instead of blind trust in the output. This track covers structuring handoffs, recovering when something breaks partway through, and building prompts you can actually reuse.",
    icon: FlowArrow,
    lessons: 6,
  },
];
