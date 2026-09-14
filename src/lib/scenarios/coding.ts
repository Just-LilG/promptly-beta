import type { Scenario } from "./types";

const mentions = (prompt: string, ...words: string[]) => {
  const p = prompt.toLowerCase();
  return words.some((w) => p.includes(w.toLowerCase()));
};

const wordCount = (prompt: string) => prompt.trim().split(/\s+/).filter(Boolean).length;

export const codingScenarios: Scenario[] = [
  {
    slug: "vague-bug",
    trackSlug: "coding",
    title: "Fix a bug from a vague description",
    goal:
      "The function below is supposed to return the average of a list of numbers, but it's returning the wrong value sometimes. Get the AI to actually find the bug. Don't just say \"it's broken.\"",
    context: {
      label: "Buggy code",
      language: "python",
      content:
        "def average(nums):\n    total = 0\n    for n in nums:\n        total += n\n    return total / len(nums) - 1",
    },
    rules: [
      {
        id: "shares-code",
        label: "Included the actual code, not just a description",
        test: (p) => mentions(p, "def average", "total", "len(nums)") || p.includes("```"),
        weight: 35,
        hintIfMissing:
          "Paste the actual code. \"My function is broken\" gives the AI nothing to look at, since it has to guess at code it's never seen.",
      },
      {
        id: "expected-vs-actual",
        label: "Described expected vs. actual behavior",
        test: (p) => mentions(p, "expect", "should", "instead", "wrong value", "off by"),
        weight: 35,
        hintIfMissing:
          "Say what you expected (\"should return the average\") vs. what actually happens (\"returns a number that's 1 too low\"). That contrast is what lets the AI localize the bug, instead of re-deriving your whole function from scratch.",
      },
      {
        id: "not-just-broken",
        label: "Avoided \"it's broken\" with no detail",
        test: (p) => !(mentions(p, "broken", "not working", "doesn't work") && wordCount(p) < 12),
        weight: 30,
        hintIfMissing:
          "\"It's broken\" alone forces the AI to ask a follow-up question before it can help at all. You can skip that round-trip by front-loading the detail.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const gotCode = passed.some((r) => r.id === "shares-code");
      const gotExpected = passed.some((r) => r.id === "expected-vs-actual");
      if (gotCode && gotExpected) {
        return "Looking at your code: you're subtracting 1 at the end: `return total / len(nums) - 1`. That's the bug. Due to operator precedence this computes `(total / len(nums)) - 1`, not the average of the adjusted total. Remove the `- 1` and it should return the correct average.";
      }
      if (gotCode) {
        return "I can see the code, but I'm not sure what's actually going wrong from your description. Can you tell me what output you're expecting vs. what you're actually getting?";
      }
      return "I don't have the code in front of me, so I can't point to a specific bug. Could you paste the function you're working with?";
    },
  },
  {
    slug: "real-code-review",
    trackSlug: "coding",
    title: "Get a real code review, not a rubber stamp",
    goal:
      "You want honest feedback on this function before merging it, not just \"looks good.\" Write a prompt that gets the AI to actually critique it.",
    context: {
      label: "Code to review",
      language: "javascript",
      content:
        "function getUser(id) {\n  const data = fetch('/api/users/' + id);\n  return data.json();\n}",
    },
    rules: [
      {
        id: "asks-for-issues",
        label: "Explicitly asked for problems, not just approval",
        test: (p) => mentions(p, "issue", "problem", "wrong", "concern", "critique", "bug", "risk"),
        weight: 30,
        hintIfMissing:
          "\"Does this look good?\" invites a yes. Ask directly: \"what's wrong with this\" or \"what would break in production.\"",
      },
      {
        id: "gives-criteria",
        label: "Named what to review for (readability, performance, edge cases, etc.)",
        test: (p) =>
          mentions(p, "performance", "readability", "edge case", "security", "error handling", "async", "await", "convention"),
        weight: 35,
        hintIfMissing:
          "Tell the AI what lens to review through. Unscoped, it'll skim for obvious typos. Ask about error handling, async correctness, or edge cases and it'll actually dig.",
      },
      {
        id: "discourages-flattery",
        label: "Signaled you want honest, critical feedback",
        test: (p) => mentions(p, "honest", "critical", "don't hold back", "be direct", "harsh", "nitpick"),
        weight: 35,
        hintIfMissing:
          "Models tend to default to agreeable. Explicitly asking for blunt, critical feedback measurably changes what you get back.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const askedForIssues = passed.some((r) => r.id === "asks-for-issues");
      const gaveCriteria = passed.some((r) => r.id === "gives-criteria");
      if (askedForIssues && gaveCriteria) {
        return "A few real problems: this function isn't `async`, but `fetch` returns a Promise, so `data.json()` will throw because `data` is a Promise, not a Response. There's also no error handling if the request fails or returns a non-2xx status, and no handling for a network error at all. This would crash in production the first time the API hiccups.";
      }
      if (askedForIssues) {
        return "It functions in the happy path, but I'd want to know what specifically you're worried about: performance, error handling, readability? Narrow it down and I'll give sharper feedback.";
      }
      return "Looks reasonable at a glance! Let me know if you want me to look closer at anything specific.";
    },
  },
  {
    slug: "safe-refactor",
    trackSlug: "coding",
    title: "Refactor without losing behavior",
    goal:
      "This function works, but the nested conditionals are hard to read. Get the AI to clean it up without silently changing what it does.",
    context: {
      label: "Code to refactor",
      language: "javascript",
      content:
        "function getDiscount(user) {\n  if (user.isMember) {\n    if (user.yearsActive > 5) {\n      return 0.2;\n    } else {\n      return 0.1;\n    }\n  } else {\n    return 0;\n  }\n}",
    },
    rules: [
      {
        id: "specifies-goal",
        label: "Specified the refactor goal (readability, not new logic)",
        test: (p) => mentions(p, "readab", "clean", "simplify", "clarity", "nested", "structure"),
        weight: 30,
        hintIfMissing:
          "\"Refactor this\" is ambiguous. Refactor for what? Say what's actually bothering you (nesting, naming, length).",
      },
      {
        id: "preserve-behavior",
        label: "Explicitly asked to preserve existing behavior",
        test: (p) => mentions(p, "same behavior", "same output", "don't change the logic", "preserve", "behavior should stay", "without changing what it does"),
        weight: 40,
        hintIfMissing:
          "Without this, the AI may \"improve\" the logic itself, not just its shape, including changing edge-case results. State that behavior must stay identical.",
      },
      {
        id: "wants-explanation",
        label: "Asked for an explanation of what changed",
        test: (p) => mentions(p, "explain", "what changed", "why", "walk me through"),
        weight: 30,
        hintIfMissing:
          "Asking for a diff-level explanation makes it easy to verify nothing about the actual behavior shifted. Don't just trust a rewrite blind.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const preserved = passed.some((r) => r.id === "preserve-behavior");
      if (preserved) {
        return "Here's a flattened version using early returns: same three outcomes (0.2, 0.1, 0), just no nesting:\n\n```js\nfunction getDiscount(user) {\n  if (!user.isMember) return 0;\n  return user.yearsActive > 5 ? 0.2 : 0.1;\n}\n```\nBehavior is identical for every input combination. I checked all three branches map the same way.";
      }
      return "Here's a cleaner version. I also tightened up the discount tiers a bit while I was in there, let me know if that's not what you wanted:\n\n```js\nfunction getDiscount(user) {\n  if (!user.isMember) return 0;\n  if (user.yearsActive > 3) return 0.25;\n  return 0.1;\n}\n```";
    },
  },
  {
    slug: "write-tests",
    trackSlug: "coding",
    title: "Get tests that actually catch bugs",
    goal:
      "Ask the AI to write tests for this function, but get tests that cover edge cases, not just the obvious case.",
    context: {
      label: "Function to test",
      language: "javascript",
      content: "function divide(a, b) {\n  return a / b;\n}",
    },
    rules: [
      {
        id: "names-framework",
        label: "Specified a testing framework",
        test: (p) => mentions(p, "jest", "vitest", "mocha", "test framework", "unit test"),
        weight: 25,
        hintIfMissing:
          "Without a named framework, you'll get generic pseudo-tests you have to translate yourself. Say Jest, Vitest, or whatever your project uses.",
      },
      {
        id: "asks-edge-cases",
        label: "Explicitly asked for edge cases",
        test: (p) => mentions(p, "edge case", "zero", "divide by zero", "negative", "boundary"),
        weight: 45,
        hintIfMissing:
          "This function divides by zero for `b=0`. A generic \"write tests\" ask often skips that. Naming edge cases you're worried about gets them covered.",
      },
      {
        id: "not-too-vague",
        label: "Gave enough detail to act on immediately",
        test: (p) => wordCount(p) >= 8,
        weight: 30,
        hintIfMissing:
          "A one-line \"write tests for this\" works, but pairing it with what matters to you (edge cases, coverage target) gets a far more useful first draft.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const edgeCases = passed.some((r) => r.id === "asks-edge-cases");
      if (edgeCases) {
        return "```js\ntest('divides two positive numbers', () => {\n  expect(divide(10, 2)).toBe(5);\n});\ntest('handles negative numbers', () => {\n  expect(divide(-10, 2)).toBe(-5);\n});\ntest('divide by zero returns Infinity', () => {\n  expect(divide(5, 0)).toBe(Infinity);\n});\ntest('zero divided by a number is zero', () => {\n  expect(divide(0, 5)).toBe(0);\n});\n```\nNote the divide-by-zero case: it doesn't throw in JS, it returns `Infinity`. Worth deciding if that's the behavior you actually want.";
      }
      return "```js\ntest('divides two numbers', () => {\n  expect(divide(10, 2)).toBe(5);\n});\n```\nThat covers the basic case. Let me know if you want edge cases too (zero, negatives, etc.).";
    },
  },
  {
    slug: "explain-legacy-code",
    trackSlug: "coding",
    title: "Understand code you didn't write",
    goal:
      "You've inherited this function with zero context. Get the AI to actually explain it in a way that helps you maintain it, not just restate it line by line.",
    context: {
      label: "Unfamiliar code",
      language: "python",
      content:
        "def process(data, flag=False):\n    result = [x * 2 if flag else x for x in data if x % 2 == 0]\n    return sorted(result, reverse=flag)",
    },
    rules: [
      {
        id: "states-purpose",
        label: "Asked what the code is for / its intent, not just \"what does this do\"",
        test: (p) => mentions(p, "purpose", "intent", "why", "used for", "meant to do"),
        weight: 30,
        hintIfMissing:
          "\"What does this do\" gets a line-by-line translation. \"What's this for\" gets you the actual purpose, much more useful when you're trying to maintain it.",
      },
      {
        id: "asks-for-flag-behavior",
        label: "Asked how the flag/parameter changes behavior",
        test: (p) => mentions(p, "flag", "parameter", "when true", "when false", "argument"),
        weight: 35,
        hintIfMissing:
          "This function behaves completely differently depending on `flag`. Asking specifically about it surfaces the part most likely to confuse future-you.",
      },
      {
        id: "wants-plain-language",
        label: "Asked for a plain-language summary, not just annotated code",
        test: (p) => mentions(p, "plain", "simple terms", "in words", "summarize", "summary"),
        weight: 35,
        hintIfMissing:
          "Without asking for it, you may just get the code back with comments added. A plain-language summary is what actually sticks when you revisit this in six months.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const purpose = passed.some((r) => r.id === "states-purpose");
      const flagBehavior = passed.some((r) => r.id === "asks-for-flag-behavior");
      if (purpose && flagBehavior) {
        return "This filters `data` down to even numbers, then behaves differently based on `flag`: when `flag` is `True`, it doubles each even number and sorts the result descending; when `False`, it leaves the numbers as-is and sorts ascending. So `flag` seems to represent something like \"formatted for display\" vs \"raw\", which is worth confirming with whoever wrote it, since the name `flag` alone doesn't tell you that.";
      }
      return "This takes a list, filters to even numbers, optionally doubles them, and sorts the result. It's ascending or descending depending on the flag. Let me know if you want me to go deeper on any part.";
    },
  },
  {
    slug: "error-message-context",
    trackSlug: "coding",
    title: "Bring the error message, not just the symptom",
    goal:
      "Your app is crashing. Get the AI to diagnose the actual cause, not guess at general possibilities.",
    context: {
      label: "What you're seeing",
      content:
        "Your app crashes when a user submits the signup form. You have this error in your console:\n\nTypeError: Cannot read properties of undefined (reading 'email')\n    at validateForm (signup.js:14)",
    },
    rules: [
      {
        id: "includes-error-text",
        label: "Included the actual error message",
        test: (p) => mentions(p, "typeerror", "cannot read properties", "undefined", "signup.js"),
        weight: 45,
        hintIfMissing:
          "You were given the exact error text. Use it. \"My app crashes on signup\" throws away the most useful clue you have.",
      },
      {
        id: "includes-line-context",
        label: "Mentioned where it happens (file/line/function)",
        test: (p) => mentions(p, "validateform", "line 14", "signup.js"),
        weight: 30,
        hintIfMissing:
          "The stack trace tells you exactly where to look: `validateForm` at line 14. Passing that along saves a round of \"where is this happening?\"",
      },
      {
        id: "not-generic",
        label: "Avoided a generic \"my app is crashing\" with no detail",
        test: (p) => !(mentions(p, "crash", "not working") && wordCount(p) < 10),
        weight: 25,
        hintIfMissing:
          "A short, vague report forces a diagnostic back-and-forth. You already have the diagnostic info, so lead with it.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const hasError = passed.some((r) => r.id === "includes-error-text");
      const hasLine = passed.some((r) => r.id === "includes-line-context");
      if (hasError && hasLine) {
        return "That error means something is `undefined` where your code expects an object with an `.email` property. Most likely the form data object itself is undefined when `validateForm` runs at line 14. Common causes: the field isn't being passed into the function call, or the form's `onSubmit` handler is firing before the data is populated. Check what's actually being passed into `validateForm` at the call site.";
      }
      if (hasError) {
        return "That error tells us something is undefined where `.email` is expected. Do you know which line this happens on, or can you share the surrounding code?";
      }
      return "A few things could cause a crash on signup: missing validation, a null reference, a failed API call. Do you have the actual error message from the console? That'll narrow it down a lot faster than guessing.";
    },
  },
  {
    slug: "specify-stack",
    trackSlug: "coding",
    title: "Specify your stack before asking for code",
    goal:
      "Ask the AI to write a function that fetches and displays a list of items, but make sure what you get back actually fits your project.",
    rules: [
      {
        id: "names-language",
        label: "Named the language",
        test: (p) => mentions(p, "javascript", "typescript", "python", "java", "rust", "go", "swift", "c#"),
        weight: 30,
        hintIfMissing:
          "Without a language, you're leaving it to guess, usually landing on generic JavaScript, which is useless if you're in Python or Swift.",
      },
      {
        id: "names-framework",
        label: "Named the framework/library",
        test: (p) => mentions(p, "react", "vue", "django", "flask", "next.js", "express", "svelte", "angular", "spring"),
        weight: 40,
        hintIfMissing:
          "\"Fetch and display a list\" looks completely different in React vs. plain JS vs. Django templates. Name your framework and the answer becomes directly usable.",
      },
      {
        id: "names-version-or-convention",
        label: "Mentioned a version or convention (e.g. hooks, async/await, specific syntax style)",
        test: (p) => mentions(p, "hooks", "async/await", "class component", "composition api", "version"),
        weight: 30,
        hintIfMissing:
          "Even within one framework, conventions shift over time (e.g. React class components vs. hooks). Naming your convention avoids getting outdated patterns.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const lang = passed.some((r) => r.id === "names-language");
      const framework = passed.some((r) => r.id === "names-framework");
      if (lang && framework) {
        return "Here's a React (hooks) version:\n\n```jsx\nfunction ItemList() {\n  const [items, setItems] = useState([]);\n  useEffect(() => {\n    fetch('/api/items').then(r => r.json()).then(setItems);\n  }, []);\n  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>;\n}\n```\nThis assumes your API returns an array of objects with `id` and `name`. Adjust if your shape differs.";
      }
      if (lang) {
        return "I can write this, but which framework are you using: React, Vue, plain JS, something else? The shape of this changes a lot depending on that.";
      }
      return "Happy to write this. What language and framework is your project in? That'll determine whether this looks like a React component, a Python view, or something else entirely.";
    },
  },
  {
    slug: "iterative-debugging",
    trackSlug: "coding",
    title: "Debug across multiple turns without losing the thread",
    goal:
      "The AI's first suggestion didn't fix your bug. Write a follow-up that moves the conversation forward instead of restarting from scratch.",
    context: {
      label: "What happened",
      content:
        "You asked the AI to fix a slow database query. It suggested adding an index on the `user_id` column. You added it, and the query is still slow.",
    },
    rules: [
      {
        id: "reports-outcome",
        label: "Reported that you tried the suggestion and what happened",
        test: (p) => mentions(p, "tried", "added the index", "still slow", "didn't help", "didn't work", "no change"),
        weight: 40,
        hintIfMissing:
          "Say explicitly that you applied the fix and what the result was. Without this, the AI doesn't know whether to build on its last answer or that its last answer failed.",
      },
      {
        id: "rules-out-cause",
        label: "Confirmed the index was actually applied (ruling out user error)",
        test: (p) => mentions(p, "confirmed", "verified", "checked", "it's there", "index exists"),
        weight: 25,
        hintIfMissing:
          "Before assuming a suggestion \"didn't work,\" ruling out whether it was applied correctly saves the AI from repeating already-tried ideas.",
      },
      {
        id: "gives-new-data",
        label: "Provided new information (e.g. query plan, table size, other columns filtered)",
        test: (p) => mentions(p, "explain", "query plan", "rows", "table size", "where clause", "join"),
        weight: 35,
        hintIfMissing:
          "A stuck debugging conversation needs new evidence, not just \"still slow.\" An EXPLAIN plan or details about what else the query filters on gives the AI something new to work with.",
      },
    ],
    simulateResponse: (prompt, passed) => {
      const outcome = passed.some((r) => r.id === "reports-outcome");
      const newData = passed.some((r) => r.id === "gives-new-data");
      if (outcome && newData) {
        return "Good. Since the index didn't help and you're also filtering on `created_at`, the query is likely doing a lookup on `user_id` fine but then scanning for the date range. A composite index on `(user_id, created_at)` would let the database use both filters in one pass instead of one index and a fallback scan. Can you run EXPLAIN on the query and share the output? That'll confirm exactly what's happening.";
      }
      if (outcome) {
        return "Got it, the single-column index didn't fix it. That usually means the slowness is coming from something else: another WHERE condition, a JOIN, or the amount of data being scanned. Can you share the full query and, if possible, the output of running EXPLAIN on it?";
      }
      return "Since I don't know whether the index actually helped or not, I'd just be repeating my last suggestion blind. What happened when you added it? Did the query speed up at all, stay the same, or something else?";
    },
  },
];
