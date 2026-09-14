import type { Scenario } from "./types";

const mentions = (prompt: string, ...words: string[]) => {
  const p = prompt.toLowerCase();
  return words.some((w) => p.includes(w.toLowerCase()));
};
const wordCount = (prompt: string) => prompt.trim().split(/\s+/).filter(Boolean).length;

export const everydayScenarios: Scenario[] = [
  {
    slug: "meal-plan-real-constraints",
    trackSlug: "everyday",
    title: "Get a meal plan you'll actually cook",
    goal:
      "You want a week of dinners planned. Give the AI your real constraints so the plan is usable, not generic.",
    rules: [
      {
        id: "gives-dietary-info",
        label: "Mentioned dietary needs or preferences",
        test: (p) => mentions(p, "vegetarian", "vegan", "gluten", "allergy", "dislike", "no ", "dairy"),
        weight: 30,
        hintIfMissing:
          "Without dietary constraints, you'll get a generic plan you may need to substantially rework.",
      },
      {
        id: "gives-time-budget",
        label: "Mentioned time available for cooking",
        test: (p) => mentions(p, "minutes", "quick", "under", "time", "busy", "prep time"),
        weight: 35,
        hintIfMissing:
          "A 90-minute recipe and a 15-minute recipe are both \"dinner\". Say how much time you actually have on a typical night.",
      },
      {
        id: "gives-servings-or-people",
        label: "Mentioned how many people/servings",
        test: (p) => mentions(p, "people", "serving", "family", "myself", "for two", "for one"),
        weight: 35,
        hintIfMissing:
          "Portion sizing and shopping list quantities depend on how many people this needs to feed.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const dietary = passed.some((r) => r.id === "gives-dietary-info");
      const time = passed.some((r) => r.id === "gives-time-budget");
      if (dietary && time) {
        return "Here's a 5-dinner plan built around those constraints, all under your time budget, respecting the dietary notes, with a combined shopping list at the end.";
      }
      return "I can put a plan together, but without knowing your time budget or dietary needs, this will be a generic plan you'll likely need to adjust before it's actually useful on a weeknight.";
    },
  },
  {
    slug: "trip-planning-priorities",
    trackSlug: "everyday",
    title: "Plan a trip around what you actually care about",
    goal:
      "You want a travel itinerary that fits your priorities, not a generic top-10 tourist list.",
    rules: [
      {
        id: "states-priorities",
        label: "Stated what matters most (food, pace, nature, budget, etc.)",
        test: (p) => mentions(p, "food", "relax", "nature", "budget", "hike", "museum", "nightlife", "slow pace", "adventure"),
        weight: 40,
        hintIfMissing:
          "\"Plan a trip to X\" without priorities gets a generic list of famous sights. Say what actually matters to you: food, pace, nature, budget.",
      },
      {
        id: "names-what-to-avoid",
        label: "Mentioned what to avoid",
        test: (p) => mentions(p, "avoid", "not interested in", "skip", "don't want", "tourist trap"),
        weight: 30,
        hintIfMissing:
          "Naming what you don't want (crowded spots, long transit days) is often as useful as naming what you do.",
      },
      {
        id: "gives-length-and-group",
        label: "Gave trip length and who's going",
        test: (p) => mentions(p, "days", "week", "with kids", "solo", "couple", "friends"),
        weight: 30,
        hintIfMissing:
          "Length and group composition change the entire itinerary. A family trip and a solo trip need very different pacing.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const priorities = passed.some((r) => r.id === "states-priorities");
      const avoid = passed.some((r) => r.id === "names-what-to-avoid");
      if (priorities && avoid) {
        return "Built this itinerary around those priorities and steered around the things you said to avoid. Should feel a lot more like your trip than a generic guidebook rundown.";
      }
      return "I can put together an itinerary, but without your actual priorities, I'll default to the standard highlights list, which may not match what you're actually looking for.";
    },
  },
  {
    slug: "realistic-learning-plan",
    trackSlug: "everyday",
    title: "Get a learning plan that fits your real life",
    goal:
      "You want to learn a new skill. Get a plan shaped by your actual time and goal, not a generic resource list.",
    rules: [
      {
        id: "gives-time-available",
        label: "Mentioned time available per week",
        test: (p) => mentions(p, "hour", "week", "minutes a day", "time i have"),
        weight: 35,
        hintIfMissing:
          "A plan built for 10 hours/week and one built for 2 hours/week should look completely different. Say what you actually have.",
      },
      {
        id: "states-concrete-goal",
        label: "Stated a specific goal, not just \"get better\"",
        test: (p) => wordCount(p) > 12 && !mentions(p, "get better at", "improve at"),
        weight: 40,
        hintIfMissing:
          "\"Get better at guitar\" isn't a plan-able goal. \"Play three songs I like within 3 months\" is. Get specific about the actual outcome.",
      },
      {
        id: "asks-for-milestones",
        label: "Asked for milestones, not just a resource list",
        test: (p) => mentions(p, "milestone", "checkpoint", "progress", "weekly plan", "by week"),
        weight: 25,
        hintIfMissing:
          "A list of resources isn't a plan. Ask for milestones or a week-by-week structure so you can tell if you're on track.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const time = passed.some((r) => r.id === "gives-time-available");
      const goal = passed.some((r) => r.id === "states-concrete-goal");
      if (time && goal) {
        return "With that time budget and a concrete goal, here's a week-by-week plan with checkpoints, built to actually fit around your schedule instead of assuming unlimited free time.";
      }
      return "I can suggest resources, but without a real time budget and a specific goal, this ends up being a generic list rather than something you can actually follow and measure progress against.";
    },
  },
  {
    slug: "personal-advice-context",
    trackSlug: "everyday",
    title: "Get advice that fits your actual situation",
    goal:
      "You want advice on a personal decision. Give enough real context that the answer isn't generic life-advice filler.",
    rules: [
      {
        id: "gives-real-context",
        label: "Gave specific context about the actual situation",
        test: (p) => wordCount(p) > 25,
        weight: 45,
        hintIfMissing:
          "\"Should I do X?\" with no context gets generic pros-and-cons filler. The specifics of your actual situation are what make advice useful.",
      },
      {
        id: "states-what-matters",
        label: "Stated what actually matters to the decision",
        test: (p) => mentions(p, "important to me", "matters most", "priority", "biggest concern"),
        weight: 30,
        hintIfMissing:
          "Naming your actual priority (financial security, time with family, career growth) helps the advice weigh trade-offs the way you would.",
      },
      {
        id: "not-just-yes-no",
        label: "Asked for reasoning, not just a yes/no",
        test: (p) => mentions(p, "why", "how should i think about", "what would you consider"),
        weight: 25,
        hintIfMissing:
          "A yes/no answer to a personal decision is less useful than understanding the reasoning. Ask for that explicitly.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const context = passed.some((r) => r.id === "gives-real-context");
      const priority = passed.some((r) => r.id === "states-what-matters");
      if (context && priority) {
        return "Given what you've described and that priority specifically, here's how I'd think through it: [weighs the actual trade-off against the stated priority]. This isn't a definitive answer, but it's grounded in your actual situation rather than generic advice.";
      }
      return "I can share general considerations, but with more detail about your actual situation and what matters most to you, I could give you something a lot more specific than generic pros and cons.";
    },
  },
  {
    slug: "quick-daily-task",
    trackSlug: "everyday",
    title: "Know when a quick prompt is enough",
    goal:
      "Not every request needs elaborate constraints. Practice recognizing when a short, simple prompt is the right call.",
    context: {
      label: "The task",
      content: "You want a quick idea for a side dish to go with grilled salmon tonight.",
    },
    rules: [
      {
        id: "appropriately-brief",
        label: "Kept the prompt appropriately short",
        test: (p) => wordCount(p) <= 20,
        weight: 50,
        hintIfMissing:
          "This is a low-stakes, simple ask. A long prompt with roles, constraints, and formatting requests would be overkill here.",
      },
      {
        id: "still-includes-basics",
        label: "Still included the one relevant detail (pairs with salmon)",
        test: (p) => mentions(p, "salmon", "side", "pair"),
        weight: 50,
        hintIfMissing:
          "Even a short prompt needs the one detail that actually matters: what it needs to go with.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const brief = passed.some((r) => r.id === "appropriately-brief");
      const relevant = passed.some((r) => r.id === "still-includes-basics");
      if (brief && relevant) {
        return "Roasted asparagus with lemon, or a simple garlic couscous. Both come together in under 20 minutes and won't compete with the salmon.";
      }
      if (relevant) {
        return "A few good options: roasted asparagus, garlic couscous, or a simple green salad. (This kind of everyday question doesn't need much more detail than you gave. Good instinct keeping it simple.)";
      }
      return "Happy to suggest a side. What's it pairing with?";
    },
  },
];
