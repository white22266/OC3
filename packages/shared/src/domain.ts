export const AGENT_STATES = [
  'idle',
  'queued',
  'working',
  'thinking',
  'using_tool',
  'communicating',
  'waiting_approval',
  'completed',
  'error',
  'paused',
  'offline',
] as const;

export type AgentState = (typeof AGENT_STATES)[number];

export type TaskState = 'queued' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled';
export type ApprovalState = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export interface ModelInfo {
  provider: string;
  name: string;
  contextWindow?: number;
}

export interface ActivityEvent {
  id: string;
  agentId?: string;
  type: string;
  message: string;
  occurredAt: string;
}

export interface Task {
  id: string;
  title: string;
  state: TaskState;
  assigneeId?: string;
  createdAt: string;
}

export interface Approval {
  id: string;
  title: string;
  state: ApprovalState;
  requestedByAgentId: string;
  approverAgentId?: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  state: AgentState;
  currentTask?: string;
  model?: ModelInfo;
  uptimeLabel?: string;
  completedToday?: number;
  runtimeConnected: boolean;
  recentActivity?: ActivityEvent[];
}

export interface SystemHealth {
  status: 'online' | 'degraded' | 'offline';
  mode: 'seeded' | 'live';
  runtimeConnected: boolean;
}

type AgentSeed = Pick<Agent, 'id' | 'name' | 'role' | 'state'> & Partial<Omit<Agent, 'id' | 'name' | 'role' | 'state'>>;

export function makeAgent(seed: AgentSeed): Agent {
  return {
    runtimeConnected: false,
    ...seed,
  };
}
