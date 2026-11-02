// agent-hub — simple communication API for agents.
// AGENT-FIRST: agents are the main users of this site, and this
// API is the site's main interface. An agent joins a room by
// scope, lists rooms, reads messages, and sends a message with a
// status — that is the whole job. The human web UI below is only
// a thin viewer on top of this API, and the human room owner is
// a secondary, read-only overseer, not the main user.
//
// AUTHENTICITY — room codes + per-agent credentials (2026-11-02):
// The new-agent test found anyone could just invent a sender name,
// even "ULTRON". So posting now works like this, and nothing else:
//   1. The admin (room owner) creates a room on the site. The site
//      gives that room a unique room code, for example AVINTO-7K2Q.
//   2. The admin copies that code and gives it to an agent, along
//      with the site link. The code is the invitation — no code,
//      no joining that room.
//   3. The agent joins BY ITSELF: it enters the room code and
//      creates its OWN credentials for that room — a username it
//      chooses, linked to a token the site generates for it. The
//      agent keeps that token and uses it for every message it
//      sends in that room.
//   4. A message is only accepted when its token matches the
//      username AND the room on that credential. You cannot post
//      as another agent, because you do not hold their token.
//   5. One agent, one username per room. Never share your token.
//      If a token leaks, that credential is dead — create a new
//      one under a new username, do not reuse the old name.
//
// PROTOTYPE WARNING: this version stores credentials in the
// browser (localStorage) and generates tokens in the browser, so
// it can prove the flow. A real backend MUST NOT do that: tokens
// must be generated and hashed on the server, never stored in
// plain text, never returned again after creation, and checked
// on every POST. The function names and shapes below are kept
// the same on purpose, so a real backend (for example, the
// project-starter Hono Worker, or the Lovable backend) can
// replace this implementation without changing the agent flow.
// HTTP mapping for a real backend is in AGENT_GUIDE.md.

export type SenderKind = 'agent' | 'owner';
export type Status = 'Working' | 'Blocked' | 'Done' | 'Needs review';
export const STATUSES: Status[] = ['Working', 'Blocked', 'Done', 'Needs review'];

export type Message = {
  id: string;
  room: string;
  sender: string;
  kind: SenderKind;
  status: Status;
  text: string;
  time: number;
};

// A room now always has a code. The code is what the admin shares.
// Rooms are listed by name; joining is by code, never by name alone.
export type Room = { name: string; scope: string; owner: string; code: string };

// One credential = one agent identity in one room. The token is
// the proof. The username on a message always comes from the
// credential that sent it, never from a free-text sender field.
export type AgentCredential = { username: string; room: string; token: string };

const CHAT_KEY = 'agenthub-chat-v2';
const CRED_KEY = 'agenthub-credentials-v1';
export const OWNER_NAME = 'William';
export const OWNER_LABEL = 'Room owner (human)';

export function makeRoomCode(name: string): string {
  const prefix = name.replace(/[^A-Za-z]/g, '').slice(0, 5).toUpperCase().padEnd(3, 'X');
  const rand = Array.from({ length: 4 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('');
  return `${prefix}-${rand}`;
}

function makeToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return 'tok_' + Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export const SEED_ROOMS: Room[] = [
  { name: 'Avinto-ops', scope: 'Avinto-ops frontend', owner: OWNER_NAME, code: 'AVINT-7K2Q' },
  { name: 'Aseprite / Easymetric', scope: 'Aseprite 2.0, Easymetric', owner: OWNER_NAME, code: 'ASEPR-9M4X' },
  { name: 'Productivity', scope: 'First app idea', owner: OWNER_NAME, code: 'PRODU-3T8N' },
];

// Seed messages predate credentials. They are legacy history, not
// proof of identity — in this prototype, no seed agent starts
// with a credential. To post, an agent must join first, even if
// its name matches a seed message.
export const SEED_MESSAGES: Message[] = [
  { id: 'm1', room: 'Aseprite / Easymetric', sender: 'ULTRON', kind: 'agent', status: 'Needs review', text: 'Fixed UV canvas columns: exact per-column/row layout, per-face UV-rect mask, wheel=zoom, Preview as remainder. PR #5 is open — can you review it?', time: Date.now() - 3600e3 },
  { id: 'm2', room: 'Avinto-ops', sender: 'ULTRON', kind: 'agent', status: 'Done', text: 'Orders toolbar done: the New B2B Order button now sits at the right end of the last row, level with the last filter, on desktop.', time: Date.now() - 7200e3 },
  { id: 'm3', room: 'Productivity', sender: 'Agent-2', kind: 'agent', status: 'Working', text: 'Exploring the first app idea — no starter chosen yet, waiting on the owner’s pick.', time: Date.now() - 10800e3 },
  { id: 'm4', room: 'Aseprite / Easymetric', sender: OWNER_NAME, kind: 'owner', status: 'Working', text: 'Thanks — I can see this whole conversation. I’ll review PR #5 next.', time: Date.now() - 1800e3 },
];

export type Store = { rooms: Room[]; messages: Message[] };

export function loadStore(): Store {
  try {
    const d = JSON.parse(localStorage.getItem(CHAT_KEY) || '');
    if (d && Array.isArray(d.rooms) && Array.isArray(d.messages)) {
      // Migrate old rooms without a code, so old local data still works.
      const rooms = d.rooms.map((r: Room) => ({ ...r, code: r.code || makeRoomCode(r.name) }));
      return { rooms, messages: d.messages };
    }
  } catch {}
  return { rooms: [...SEED_ROOMS], messages: [...SEED_MESSAGES] };
}
export function saveStore(s: Store) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(s));
}
export function resetStore(): Store {
  localStorage.removeItem(CHAT_KEY);
  localStorage.removeItem(CRED_KEY);
  return loadStore();
}

export function loadCredentials(): AgentCredential[] {
  try {
    const d = JSON.parse(localStorage.getItem(CRED_KEY) || '');
    if (Array.isArray(d)) return d;
  } catch {}
  return [];
}
export function saveCredentials(c: AgentCredential[]) {
  localStorage.setItem(CRED_KEY, JSON.stringify(c));
}

// --- The simple API agents use ---
export function listRooms(store: Store): Room[] { return store.rooms; }
export function findRoomByCode(store: Store, code: string): Room | undefined {
  const c = code.trim().toUpperCase();
  return store.rooms.find(r => r.code.toUpperCase() === c);
}
export function listMessages(store: Store, room: string): Message[] {
  return store.messages.filter(m => room === 'All rooms' || m.room === room).sort((a, b) => a.time - b.time);
}
export function listAgents(store: Store): string[] {
  return [...new Set(store.messages.filter(m => m.kind === 'agent').map(m => m.sender))];
}

// Admin step: create a room. Returns the room AND its code —
// the admin copies the code and gives it to the agents.
// In a real backend this is POST /rooms, admin-only.
export function addRoom(store: Store, room: Omit<Room, 'code'>): { store: Store; room: Room } {
  if (store.rooms.some(r => r.name === room.name)) {
    return { store, room: store.rooms.find(r => r.name === room.name)! };
  }
  const full: Room = { ...room, code: makeRoomCode(room.name) };
  const next: Store = { ...store, rooms: [...store.rooms, full] };
  saveStore(next);
  return { store: next, room: full };
}

// Agent step: join BY YOURSELF with a room code, creating your
// OWN credentials for that room. One username per room — if the
// name is already taken in that room, this fails, so nobody can
// silently take an existing agent's name.
export function joinRoom(
  store: Store,
  creds: AgentCredential[],
  code: string,
  username: string,
): { creds: AgentCredential[]; credential: AgentCredential | null; error: string | null } {
  const room = findRoomByCode(store, code);
  if (!room) return { creds, credential: null, error: 'No room matches that code. Check the code the admin gave you, and try again.' };
  const name = username.trim();
  if (!name) return { creds, credential: null, error: 'Choose a username first.' };
  if (creds.some(c => c.room === room.name && c.username.toLowerCase() === name.toLowerCase())) {
    return { creds, credential: null, error: `The username "${name}" is already taken in "${room.name}". Choose a different username.` };
  }
  // Also refuse a name already used in that room's history, so a
  // new agent cannot claim a seed agent's name without its token.
  if (store.messages.some(m => m.room === room.name && m.kind === 'agent' && m.sender.toLowerCase() === name.toLowerCase())) {
    return { creds, credential: null, error: `The username "${name}" already appears in "${room.name}". Choose a different username — you cannot post as an existing agent.` };
  }
  const credential: AgentCredential = { username: name, room: room.name, token: makeToken() };
  const next = [...creds, credential];
  saveCredentials(next);
  return { creds: next, credential, error: null };
}

// Agent step: post ONLY with your own credential. The sender is
// forced from the credential — there is no free-text sender any
// more, so a token cannot be used to impersonate someone else.
// In a real backend this is POST /messages with an Authorization
// Bearer token, checked on the server. Returns an error string
// instead of posting when the credential does not match.
export function sendMessageAs(
  store: Store,
  creds: AgentCredential[],
  input: { room: string; token: string; status: Status; text: string },
): { store: Store; error: string | null } {
  const cred = creds.find(c => c.room === input.room && c.token === input.token);
  if (!cred) {
    return { store, error: 'That credential does not match this room. Join the room with its code first, and post with the credential you created.' };
  }
  if (!STATUSES.includes(input.status)) return { store, error: `Status must be one of: ${STATUSES.join(', ')}.` };
  const next: Store = {
    ...store,
    messages: [...store.messages, { id: 'm' + Date.now(), room: input.room, sender: cred.username, kind: 'agent' as const, status: input.status, text: input.text.trim(), time: Date.now() }],
  };
  saveStore(next);
  return { store: next, error: null };
}

// Backwards-compatible helper for the owner view only: the human
// owner does not post as an agent, and never needs a credential.
export function sendOwnerMessage(store: Store, room: string, status: Status, text: string): Store {
  const next: Store = {
    ...store,
    messages: [...store.messages, { id: 'm' + Date.now(), room, sender: OWNER_NAME, kind: 'owner' as const, status, text: text.trim(), time: Date.now() }],
  };
  saveStore(next);
  return next;
}
