import type { Scenario } from "./types";

const mentions = (prompt: string, ...words: string[]) => {
  const p = prompt.toLowerCase();
  return words.some((w) => p.includes(w.toLowerCase()));
};
const wordCount = (prompt: string) => prompt.trim().split(/\s+/).filter(Boolean).length;

export const businessScenarios: Scenario[] = [
  {
    slug: "meeting-notes-to-minutes",
    trackSlug: "business",
    title: "Turn raw notes into something your team can act on",
    goal:
      "You have messy meeting notes. Get structured minutes your team can actually use, not a reformatted wall of text.",
    context: {
      label: "Raw notes",
      content:
        "talked about q3 budget, sarah thinks we're overspending on ads, need to decide by friday, mike will get the numbers together, also discussed the new hire timeline, pushed to october, alex to send updated job post",
    },
    rules: [
      {
        id: "requests-structure",
        label: "Asked for specific sections (decisions, action items, etc.)",
        test: (p) => mentions(p, "action item", "decision", "owner", "deadline", "section"),
        weight: 45,
        hintIfMissing:
          "\"Clean this up\" alone might just fix grammar. Ask for specific structure: decisions made, action items with owners, open questions.",
      },
      {
        id: "asks-for-owners",
        label: "Asked action items to include who's responsible",
        test: (p) => mentions(p, "who", "owner", "responsible", "assigned"),
        weight: 30,
        hintIfMissing:
          "Minutes without named owners on action items tend to get ignored. Ask for that explicitly.",
      },
      {
        id: "not-just-reformat",
        label: "Asked for more than just formatting",
        test: (p) => !(mentions(p, "clean up", "format this") && wordCount(p) < 8),
        weight: 25,
        hintIfMissing:
          "A bare \"clean this up\" risks a nicer-looking version of the same unstructured content, rather than genuinely organized minutes.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const structure = passed.some((r) => r.id === "requests-structure");
      const owners = passed.some((r) => r.id === "asks-for-owners");
      if (structure && owners) {
        return "**Decisions:** Q3 ad budget needs review, decision due Friday.\n**Action items:**\n- Mike: compile ad spend numbers (by Friday)\n- Alex: send updated job post for new hire role\n**Notes:** New hire timeline pushed to October. Sarah flagged possible ad overspend as the driver for the budget review.";
      }
      return "Here's a cleaned-up version of your notes in paragraph form. Let me know if you'd like this broken into decisions, action items, and owners instead. That's usually more useful for a team to act on.";
    },
  },
  {
    slug: "presentation-with-throughline",
    trackSlug: "business",
    title: "Outline a deck that argues something",
    goal:
      "You need a presentation outline that builds toward a point, not just a slide-by-slide list of facts.",
    rules: [
      {
        id: "states-core-argument",
        label: "Stated the core argument/takeaway",
        test: (p) => mentions(p, "argue", "main point", "takeaway", "convince", "recommendation"),
        weight: 45,
        hintIfMissing:
          "A deck without a stated argument tends to become a list of facts rather than a case for something. Say what you want the audience to conclude.",
      },
      {
        id: "names-audience",
        label: "Named the audience",
        test: (p) => mentions(p, "executive", "team", "client", "board", "stakeholder", "investor"),
        weight: 30,
        hintIfMissing:
          "Different audiences need different levels of detail and different framing of the same argument. Name who's in the room.",
      },
      {
        id: "gives-slide-count",
        label: "Gave a rough slide count or time limit",
        test: (p) => mentions(p, "slides", "minutes", "10 slide", "5 slide"),
        weight: 25,
        hintIfMissing:
          "A slide count or time limit shapes how much can go on each slide. Without it, the outline may be too dense or too sparse.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const argument = passed.some((r) => r.id === "states-core-argument");
      const audience = passed.some((r) => r.id === "names-audience");
      if (argument && audience) {
        return "Building this around that argument, with each slide advancing toward it rather than just presenting a fact, framed for that audience's priorities specifically. Outline coming up.";
      }
      return "I can outline this, but without a stated core argument, I'll likely produce a list of relevant facts rather than a deck that builds a case for something specific.";
    },
  },
  {
    slug: "structured-output-format",
    trackSlug: "business",
    title: "Get output in a format your team can actually use",
    goal:
      "You need this turned into something that fits directly into a spreadsheet or ticket system, not prose you'd have to reformat yourself.",
    rules: [
      {
        id: "names-exact-format",
        label: "Specified an exact target format",
        test: (p) => mentions(p, "csv", "table", "json", "markdown table", "columns", "spreadsheet", "bullet"),
        weight: 45,
        hintIfMissing:
          "\"Organize this\" is ambiguous about format. Say exactly what shape you need: a table with named columns, CSV, bullet list.",
      },
      {
        id: "names-fields",
        label: "Named the specific fields/columns needed",
        test: (p) => mentions(p, "column", "field", "name, ", "date, ", "priority", "status"),
        weight: 35,
        hintIfMissing:
          "Naming the exact fields (name, date, priority, owner) means you don't have to restructure the output yourself afterward.",
      },
      {
        id: "flags-edge-cases",
        label: "Asked for unclear/incomplete items to be flagged, not guessed",
        test: (p) => mentions(p, "flag", "unclear", "missing", "don't guess", "note if"),
        weight: 20,
        hintIfMissing:
          "Without this, missing information in messy source data may get silently filled in rather than flagged as a gap.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const format = passed.some((r) => r.id === "names-exact-format");
      const fields = passed.some((r) => r.id === "names-fields");
      if (format && fields) {
        return "Here's the data in exactly that format with the fields you specified. I've left two rows marked \"unclear\" rather than guessing, since the source notes didn't specify a priority for them.";
      }
      return "I can restructure this, but without a specific target format and field list, I'll pick a reasonable structure myself, which you may still need to reshape for your actual tool.";
    },
  },
  {
    slug: "data-to-decision",
    trackSlug: "business",
    title: "Push data toward a decision, not just a description",
    goal:
      "You have quarterly numbers. Get an answer that actually helps you decide something, not a recap of the spreadsheet.",
    rules: [
      {
        id: "states-decision",
        label: "Stated the actual decision this needs to inform",
        test: (p) => mentions(p, "decide", "decision", "should we", "recommend", "which option"),
        weight: 45,
        hintIfMissing:
          "Data without a stated decision often just gets restated back to you. Say what you're actually trying to decide.",
      },
      {
        id: "asks-for-caveat",
        label: "Asked what could make the recommendation wrong",
        test: (p) => mentions(p, "caveat", "risk", "what could go wrong", "assumption", "wrong if"),
        weight: 35,
        hintIfMissing:
          "A good recommendation names its own assumptions and risks. Ask for that explicitly rather than taking a confident answer at face value.",
      },
      {
        id: "provides-context",
        label: "Gave enough context (time period, comparison baseline)",
        test: (p) => wordCount(p) > 15,
        weight: 20,
        hintIfMissing:
          "Raw numbers without context (compared to what? over what period?) limit how useful any recommendation can be.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const decision = passed.some((r) => r.id === "states-decision");
      const caveat = passed.some((r) => r.id === "asks-for-caveat");
      if (decision && caveat) {
        return "Based on the trend, I'd lean toward [option]. The main risk to this recommendation: it assumes the pattern from the last two quarters continues. If that was driven by a one-time factor, the recommendation could be wrong. Worth checking what drove the change before committing.";
      }
      return "Looking at the numbers, there's a clear trend, but I don't know what decision this is meant to inform. Tell me the actual choice you're weighing and I can give you a real recommendation instead of just describing the data.";
    },
  },
  {
    slug: "delegate-clear-scope",
    trackSlug: "business",
    title: "Delegate a task with a clear definition of done",
    goal:
      "You're asking the AI to draft something on your behalf for a colleague. Make sure \"done\" is unambiguous.",
    rules: [
      {
        id: "states-deliverable",
        label: "Stated exactly what the final deliverable is",
        test: (p) => mentions(p, "draft", "document", "email", "report", "deliverable", "produce"),
        weight: 35,
        hintIfMissing:
          "Say precisely what you want at the end: a draft email, a one-page summary, a full report, not just a topic.",
      },
      {
        id: "gives-constraints",
        label: "Gave concrete constraints (length, tone, deadline context)",
        test: (p) => mentions(p, "length", "words", "tone", "by ", "deadline", "formal", "informal"),
        weight: 35,
        hintIfMissing:
          "Constraints (length, tone, urgency) are what separate a usable first draft from one that needs heavy rework.",
      },
      {
        id: "defines-done",
        label: "Described what a successful result looks like",
        test: (p) => mentions(p, "should include", "needs to cover", "success", "goal is"),
        weight: 30,
        hintIfMissing:
          "Stating what success looks like (what it needs to cover, what reaction it should get) reduces back-and-forth revisions.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const deliverable = passed.some((r) => r.id === "states-deliverable");
      const constraints = passed.some((r) => r.id === "gives-constraints");
      if (deliverable && constraints) {
        return "Clear enough to work from directly. Drafting that deliverable now within the constraints you gave. This should need minimal rework.";
      }
      return "I can draft something, but without clearer constraints on length, tone, or what needs to be covered, expect to spend a round or two refining it into something usable.";
    },
  },
  {
    slug: "honest-strategy-critique",
    trackSlug: "business",
    title: "Get honest pushback on a strategy, not agreement",
    goal:
      "You have a plan you're fairly attached to. Get the AI to actually stress-test it instead of validating it.",
    rules: [
      {
        id: "asks-for-weaknesses",
        label: "Explicitly asked for weaknesses or risks",
        test: (p) => mentions(p, "weakness", "risk", "wrong with", "problem with", "poke holes"),
        weight: 45,
        hintIfMissing:
          "\"What do you think of this plan?\" invites agreement. Ask directly for weaknesses, risks, or what could fail.",
      },
      {
        id: "invites-disagreement",
        label: "Signaled you want disagreement, not validation",
        test: (p) => mentions(p, "disagree", "don't just agree", "be critical", "honest", "devil's advocate"),
        weight: 35,
        hintIfMissing:
          "Models tend toward agreeable defaults. Explicitly inviting disagreement changes the kind of feedback you get.",
      },
      {
        id: "not-leading",
        label: "Avoided phrasing that signals the answer you want",
        test: (p) => !mentions(p, "great plan, right", "this should work"),
        weight: 20,
        hintIfMissing: "Leading phrasing nudges toward confirmation rather than honest assessment.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const weaknesses = passed.some((r) => r.id === "asks-for-weaknesses");
      const invite = passed.some((r) => r.id === "invites-disagreement");
      if (weaknesses && invite) {
        return "Being direct: the plan assumes a level of team capacity that isn't accounted for elsewhere in your timeline, and the second phase depends on an external approval you haven't mentioned securing yet. Both are real risks to the timeline as written.";
      }
      return "The plan has a clear structure. If you want me to actually stress-test it for weaknesses rather than just describe it back, ask me directly to poke holes in it. I'll default to a more agreeable read otherwise.";
    },
  },
  {
    slug: "cross-functional-brief",
    trackSlug: "business",
    title: "Write a brief that works across teams",
    goal:
      "You need a project brief that both engineering and marketing can use. Get something that doesn't assume shared context it doesn't have.",
    rules: [
      {
        id: "names-both-audiences",
        label: "Named the multiple audiences involved",
        test: (p) => mentions(p, "engineering", "marketing", "both teams", "cross-functional", "stakeholders"),
        weight: 40,
        hintIfMissing:
          "A brief written for one team's context often confuses the other. Name all the audiences up front.",
      },
      {
        id: "asks-to-avoid-jargon",
        label: "Asked to avoid team-specific jargon",
        test: (p) => mentions(p, "jargon", "avoid technical terms", "plain language", "accessible to"),
        weight: 35,
        hintIfMissing:
          "Each team has its own shorthand. Ask explicitly for language that doesn't assume either team's specific vocabulary.",
      },
      {
        id: "states-shared-goal",
        label: "Stated the shared goal both teams need to align on",
        test: (p) => mentions(p, "goal", "objective", "aligned on", "outcome"),
        weight: 25,
        hintIfMissing:
          "A cross-functional brief works best when it states the shared outcome, not just each team's individual tasks.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const audiences = passed.some((r) => r.id === "names-both-audiences");
      const jargon = passed.some((r) => r.id === "asks-to-avoid-jargon");
      if (audiences && jargon) {
        return "Writing this so both teams can read it without translation, avoiding engineering-specific implementation terms and marketing-specific campaign shorthand, focusing on the shared goal and each team's part in it.";
      }
      return "I can draft this, but without knowing all the teams involved, I might default to language or assumptions that fit one team better than the other.";
    },
  },
];
