// MOCK data only. Send's backend (Neon message storage, signed-in posting,
// live-or-poll wire, moderation — see PROJECT_PLAN.md) doesn't exist yet.
// This file simulates a room with a few other participants so the interface
// can be built and demoed honestly, without pretending real people are here.
// Swap this module out for real API calls once the backend lands; nothing
// in send-client.tsx should need to change shape when that happens.

export type MockSender = {
  id: string;
  name: string;
  colorSeed: string; // used to derive a stable avatar tint
};

export type MockMessage = {
  id: string;
  senderId: string | "me";
  text: string;
  at: number; // epoch ms
  replyTo?: string; // id of another MockMessage
};

export const MOCK_PARTICIPANTS: MockSender[] = [
  { id: "u_amara", name: "Amara K.", colorSeed: "amara" },
  { id: "u_dev", name: "Dev R.", colorSeed: "dev" },
  { id: "u_lin", name: "Lin C.", colorSeed: "lin" },
];

const now = Date.now();
const min = 60_000;

export const MOCK_ROOM_NAME = "Prompt Crafters";

export const MOCK_MESSAGES: MockMessage[] = [
  { id: "m1", senderId: "u_amara", text: "anyone found a good system prompt for keeping GPT terse?", at: now - 42 * min },
  { id: "m2", senderId: "u_amara", text: "mine keeps padding every answer with a summary at the end lol", at: now - 41 * min },
  { id: "m3", senderId: "u_dev", text: "try telling it explicitly not to summarize unless asked", at: now - 38 * min },
  { id: "m4", senderId: "me", text: "adding a max sentence count works pretty well too", at: now - 35 * min },
  { id: "m5", senderId: "u_lin", text: "oh nice, going to try that on my rewrite pipeline", at: now - 30 * min, replyTo: "m4" },
  { id: "m6", senderId: "u_dev", text: "share it if it works well, curious", at: now - 29 * min },
  { id: "m7", senderId: "me", text: "will do", at: now - 12 * min },
];
