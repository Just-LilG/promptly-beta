import type { Scenario } from "./types";

const mentions = (prompt: string, ...words: string[]) => {
  const p = prompt.toLowerCase();
  return words.some((w) => p.includes(w.toLowerCase()));
};
const wordCount = (prompt: string) => prompt.trim().split(/\s+/).filter(Boolean).length;

export const designScenarios: Scenario[] = [
  {
    slug: "vague-style-request",
    trackSlug: "design",
    title: "Turn \"make it nice\" into a real style brief",
    goal:
      "You need a hero image for a landing page. Write a prompt that actually specifies style, not just a subject.",
    rules: [
      {
        id: "names-style",
        label: "Named a visual style",
        test: (p) => mentions(p, "minimalist", "flat", "realistic", "illustration", "3d", "photo", "sketch", "watercolor", "geometric", "cartoon"),
        weight: 35,
        hintIfMissing:
          "\"A nice hero image\" could mean a hundred different visual styles. Name one: minimalist, photorealistic, flat illustration, whatever fits.",
      },
      {
        id: "names-mood",
        label: "Described the mood or feeling",
        test: (p) => mentions(p, "calm", "energetic", "professional", "playful", "bold", "warm", "moody", "bright", "serene"),
        weight: 30,
        hintIfMissing:
          "Mood words (calm, energetic, bold) steer color, composition, and lighting choices far more than a bare subject description does.",
      },
      {
        id: "names-color",
        label: "Gave a color direction",
        test: (p) => mentions(p, "color", "palette", "blue", "green", "warm tone", "cool tone", "monochrome", "vibrant", "muted"),
        weight: 35,
        hintIfMissing:
          "Without a color direction, you'll get whatever the model defaults to, often generic. Even a loose direction (\"muted earth tones\") narrows this a lot.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const style = passed.some((r) => r.id === "names-style");
      const color = passed.some((r) => r.id === "names-color");
      if (style && color) {
        return "Got it. I'll aim for [that style] with a [color direction] palette, matching the mood you described. Generating a few variations now for you to pick a direction from.";
      }
      if (style) {
        return "I can go with that style, but I don't have a color direction. I'll default to something neutral unless you tell me otherwise.";
      }
      return "I can make something, but without a style or mood direction I'm likely to land on a generic stock-photo look. Want to narrow it down?";
    },
  },
  {
    slug: "ui-mockup-constraints",
    trackSlug: "design",
    title: "Request a UI mockup that fits your actual product",
    goal:
      "You want a mockup for a settings screen in a mobile app. Give the AI enough real constraints that the output is usable, not generic.",
    rules: [
      {
        id: "names-platform",
        label: "Specified platform (mobile/desktop/web)",
        test: (p) => mentions(p, "mobile", "ios", "android", "desktop", "web app", "tablet"),
        weight: 30,
        hintIfMissing:
          "A settings screen looks completely different on mobile vs. desktop. Name the platform up front.",
      },
      {
        id: "lists-elements",
        label: "Listed the specific elements/settings needed",
        test: (p) => mentions(p, "toggle", "list", "option", "section", "profile", "notification", "account", "privacy"),
        weight: 40,
        hintIfMissing:
          "\"A settings screen\" is too open-ended. List the actual settings/sections you need: notifications, account, privacy, whatever applies.",
      },
      {
        id: "references-brand",
        label: "Referenced existing brand/style to match",
        test: (p) => mentions(p, "match", "consistent with", "existing", "brand", "style guide", "like our"),
        weight: 30,
        hintIfMissing:
          "Without a reference to match, the mockup won't fit into your existing product, and it'll look like a standalone concept.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const platform = passed.some((r) => r.id === "names-platform");
      const elements = passed.some((r) => r.id === "lists-elements");
      if (platform && elements) {
        return "Here's a mobile settings screen mockup with the sections you listed, grouped logically with toggles for the binary options and disclosure rows for anything that opens a sub-screen. Let me know if you want to adjust the grouping or add a section.";
      }
      return "I can put together a settings screen, but I'm missing either the platform or the specific settings you need. Right now I'd be guessing at a generic layout that may not match what you actually need.";
    },
  },
  {
    slug: "iterate-not-restart",
    trackSlug: "design",
    title: "Iterate on a design without losing what worked",
    goal:
      "The AI's first design draft is close, but the header is too big. Write a follow-up that fixes just that.",
    context: {
      label: "Where you are",
      content:
        "The AI generated a landing page hero design. You like the overall layout and colors, but the header text is too large and unbalanced.",
    },
    rules: [
      {
        id: "names-what-to-keep",
        label: "Said what to keep unchanged",
        test: (p) => mentions(p, "keep", "same", "don't change", "everything else"),
        weight: 40,
        hintIfMissing:
          "Without saying what to preserve, a fresh generation may change the layout and colors too, the things you already liked.",
      },
      {
        id: "names-specific-change",
        label: "Named the one specific change needed",
        test: (p) => mentions(p, "header", "smaller", "size", "font size", "balance"),
        weight: 40,
        hintIfMissing:
          "Be precise about the one thing that's wrong. \"The header is too big\" is exactly the kind of specific note that gets a targeted fix.",
      },
      {
        id: "avoids-restart-language",
        label: "Avoided restarting from scratch",
        test: (p) => !mentions(p, "start over", "try again completely", "new design", "different concept"),
        weight: 20,
        hintIfMissing:
          "Asking for something entirely new throws away the parts that were already working.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const keep = passed.some((r) => r.id === "names-what-to-keep");
      const change = passed.some((r) => r.id === "names-specific-change");
      if (keep && change) {
        return "Got it. Keeping the layout and color palette exactly as they were, just reducing the header font size and rebalancing it against the subheading. Here's the updated version.";
      }
      return "I can adjust it, but I want to confirm: should I keep the current layout and colors as-is and just fix the header, or are you open to bigger changes elsewhere too?";
    },
  },
  {
    slug: "consistent-icon-set",
    trackSlug: "design",
    title: "Get a visually consistent icon set",
    goal:
      "You need 5 icons for a nav bar. Get them to actually match each other stylistically, not look like 5 different artists made them.",
    rules: [
      {
        id: "requests-set-together",
        label: "Asked for all icons in one request, as a set",
        test: (p) => mentions(p, "set of", "consistent", "same style", "matching", "family"),
        weight: 40,
        hintIfMissing:
          "Asking for icons one at a time across separate messages often produces visibly inconsistent results. Ask for the whole set together and say they need to match.",
      },
      {
        id: "specifies-line-weight-or-fill",
        label: "Specified stroke/fill style",
        test: (p) => mentions(p, "outline", "filled", "stroke", "line weight", "solid"),
        weight: 30,
        hintIfMissing:
          "Outline vs. filled is one of the biggest consistency factors in an icon set. Specify one.",
      },
      {
        id: "lists-all-icons",
        label: "Listed exactly which icons are needed",
        test: (p) => mentions(p, "home", "search", "profile", "settings", "cart", "menu") || wordCount(p) > 15,
        weight: 30,
        hintIfMissing:
          "Name the specific icons needed (home, search, profile, etc.) rather than a vague count. \"5 icons\" alone doesn't tell the AI what they represent.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const set = passed.some((r) => r.id === "requests-set-together");
      const style = passed.some((r) => r.id === "specifies-line-weight-or-fill");
      if (set && style) {
        return "Generating all 5 as one matched set using consistent stroke weight and corner radius, so they'll sit well together in a nav bar.";
      }
      return "I can make these, but generating them one at a time (or without a specified line style) risks visible inconsistency between them. Want to lock in a shared style first?";
    },
  },
  {
    slug: "describe-layout-composition",
    trackSlug: "design",
    title: "Describe layout and composition, not just content",
    goal:
      "You want a poster design. Get the composition you actually picture, not whatever the AI defaults to.",
    rules: [
      {
        id: "names-composition",
        label: "Described the layout/composition",
        test: (p) => mentions(p, "centered", "left-aligned", "grid", "asymmetric", "top", "bottom", "layered", "collage"),
        weight: 40,
        hintIfMissing:
          "Composition (centered vs. asymmetric, where text sits relative to imagery) is often what separates a design that \"gets it\" from one that doesn't. Describe the arrangement, not just the elements.",
      },
      {
        id: "names-hierarchy",
        label: "Specified what should stand out most",
        test: (p) => mentions(p, "focal point", "main focus", "largest", "most prominent", "eye drawn to"),
        weight: 30,
        hintIfMissing:
          "Every design needs a clear visual hierarchy. Say what the eye should land on first.",
      },
      {
        id: "gives-dimensions-or-format",
        label: "Mentioned format/dimensions/aspect ratio",
        test: (p) => mentions(p, "poster", "a4", "square", "portrait", "landscape", "aspect ratio", "inches", "px"),
        weight: 30,
        hintIfMissing:
          "Format affects composition choices directly: a square social post and a tall poster need different layouts entirely.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const composition = passed.some((r) => r.id === "names-composition");
      const hierarchy = passed.some((r) => r.id === "names-hierarchy");
      if (composition && hierarchy) {
        return "Building this with the composition you described and making sure the focal point you named is the first thing the eye lands on. Generating a draft now.";
      }
      return "I can generate a poster, but without composition or hierarchy direction, I'll make my own layout call, which may not match what you're picturing.";
    },
  },
  {
    slug: "brand-consistency-check",
    trackSlug: "design",
    title: "Ask the AI to check its own consistency",
    goal:
      "You've generated several assets over a conversation. Get the AI to verify they actually look like they belong together before you use them.",
    rules: [
      {
        id: "asks-for-comparison",
        label: "Explicitly asked to compare the assets against each other",
        test: (p) => mentions(p, "compare", "consistent with each other", "match", "look the same", "cohesive"),
        weight: 45,
        hintIfMissing:
          "The AI won't automatically cross-check its own outputs unless asked. Request a direct comparison.",
      },
      {
        id: "names-consistency-dimension",
        label: "Named what dimension to check (color, style, spacing, etc.)",
        test: (p) => mentions(p, "color", "style", "spacing", "font", "proportions", "line weight"),
        weight: 35,
        hintIfMissing:
          "\"Do these match\" is vague. Say what you're checking for (color palette, style, spacing) to get a specific, useful answer.",
      },
      {
        id: "not-just-approval-seeking",
        label: "Avoided asking a yes/no that invites approval",
        test: (p) => !mentions(p, "do these look good", "is this fine", "look ok"),
        weight: 20,
        hintIfMissing:
          "\"Do these look good\" invites a reassuring yes. Ask what's inconsistent, specifically.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const compare = passed.some((r) => r.id === "asks-for-comparison");
      const dimension = passed.some((r) => r.id === "names-consistency-dimension");
      if (compare && dimension) {
        return "Comparing the assets on that dimension: the second one uses a noticeably cooler color temperature than the first and third, worth regenerating it to match, or adjusting in post.";
      }
      return "They're both usable individually, but I haven't directly compared them against each other for consistency. Want me to check a specific dimension like color or style?";
    },
  },
  {
    slug: "explain-design-choice",
    trackSlug: "design",
    title: "Get design rationale, not just output",
    goal:
      "You want to understand why a design works (or doesn't) so you can make the next one yourself. Get an explanation, not just a picture.",
    rules: [
      {
        id: "asks-why",
        label: "Asked for the reasoning behind choices",
        test: (p) => mentions(p, "why", "reasoning", "rationale", "explain the choice", "what makes"),
        weight: 50,
        hintIfMissing:
          "Asking only for output teaches you nothing for next time. Ask why a color, layout, or style choice was made.",
      },
      {
        id: "names-specific-element",
        label: "Pointed at a specific element to explain",
        test: (p) => mentions(p, "color choice", "layout", "typography", "spacing", "composition"),
        weight: 50,
        hintIfMissing:
          "A general \"explain this design\" gets a broad answer. Pointing at one specific element gets a focused, teachable one.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const why = passed.some((r) => r.id === "asks-why");
      const specific = passed.some((r) => r.id === "names-specific-element");
      if (why && specific) {
        return "The color choice leans on a split-complementary scheme. It gives contrast without the harshness of full complementary colors, which keeps the design feeling energetic but not jarring. That's a good default whenever you want a design to feel lively but still professional.";
      }
      return "I can walk through the choices behind this design. Is there a specific element (color, layout, type) you want me to focus on?";
    },
  },
];
