export type ReferenceEntry = {
  title: string;
  body: string;
};

export type ReferenceSection = {
  id: string;
  title: string;
  intro: string;
  entries: ReferenceEntry[];
};

export const referenceSections: ReferenceSection[] = [
  {
    id: "anti-patterns",
    title: "Common mistakes",
    intro: "Patterns that quietly make every prompt worse, across every domain.",
    entries: [
      {
        title: "The vague ask",
        body: "\"Make this better\" or \"help me with this\" gives the AI nothing to aim at. Say what \"better\" means (shorter, more formal, funnier, technically correct) or you're leaving the definition of success up to a guess.",
      },
      {
        title: "Contradictory instructions",
        body: "Asking for something \"brief but comprehensive\" or \"casual but very formal\" forces the AI to silently pick one and ignore the other. If two goals are in tension, say which one wins.",
      },
      {
        title: "Burying the real ask",
        body: "A long backstory before the actual question means the important part can get lost or under-weighted. Lead with what you want, then add context after.",
      },
      {
        title: "Assuming memory across chats",
        body: "A new conversation starts with zero knowledge of previous ones. If context mattered before, it has to be restated. The AI isn't being forgetful; it genuinely doesn't have it.",
      },
      {
        title: "Treating the first answer as final",
        body: "The first response is a draft, not a verdict. \"Make it shorter,\" \"try a different angle,\" or \"that's close, but change X\" almost always gets you further than starting over.",
      },
      {
        title: "Pasting sensitive content without a second thought",
        body: "Uploading a file or pasting text you didn't write? Its content is now part of the conversation, instructions and all. Treat instructions embedded in someone else's document with the same suspicion you'd give an email attachment.",
      },
      {
        title: "Over-engineering a simple ask",
        body: "Not every prompt needs five constraints and a role assignment. \"What's a good side dish for salmon\" doesn't need a persona. Match prompt effort to task complexity.",
      },
    ],
  },
  {
    id: "safety",
    title: "Safety & privacy",
    intro: "A few habits worth having before they matter.",
    entries: [
      {
        title: "Don't paste real credentials or account numbers",
        body: "Passwords, API keys, credit card numbers, government ID numbers: never paste these into any AI chat, even to \"just check the format.\" Redact or use a placeholder instead.",
      },
      {
        title: "Be careful with other people's private information",
        body: "Medical details, financial records, or personal information about someone else deserves the same caution you'd want applied to your own. Don't paste it in casually.",
      },
      {
        title: "Know that chats may be stored",
        body: "Depending on the service and its settings, conversations may be retained for abuse monitoring, product improvement, or account history. Don't treat any AI chat as a place details truly disappear from. Check the specific product's data policy if it matters to you.",
      },
      {
        title: "Watch for injected instructions in pasted content",
        body: "If you paste in a webpage, document, or email, and it contains text that looks like it's giving the AI instructions (\"ignore previous instructions and...\"), that's a red flag. Don't act on output that suddenly changed behavior after ingesting outside content.",
      },
      {
        title: "AI can sound confident and still be wrong",
        body: "Fluent, well-structured answers are not the same as correct answers. For anything with real consequences (medical, legal, financial, safety), verify independently rather than trusting tone.",
      },
    ],
  },
  {
    id: "model-differences",
    title: "Model-specific notes",
    intro: "The same instinct doesn't transfer perfectly across every tool.",
    entries: [
      {
        title: "Text models (Claude, GPT, Gemini, etc.)",
        body: "These respond well to plain, direct instructions plus explicit constraints (length, tone, format). Long, well-organized context generally helps rather than confuses them.",
      },
      {
        title: "Image models (Midjourney, DALL-E, etc.)",
        body: "These respond better to dense, descriptive phrases than full sentences. Style, lighting, composition, and reference terms carry more weight than grammar. Iteration matters more here than getting it right the first time.",
      },
      {
        title: "Coding assistants",
        body: "These need concrete artifacts (actual code, actual error messages, actual file structure) far more than natural-language description. Vague coding prompts fail in ways vague writing prompts don't.",
      },
      {
        title: "Voice assistants",
        body: "Spoken prompts tend to be shorter and less structured by nature. Front-load the most important word or constraint, since you can't easily \"reread\" a spoken prompt the way you can edit text.",
      },
    ],
  },
];
