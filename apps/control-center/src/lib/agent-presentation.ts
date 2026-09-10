import type { AgentState } from '@oc3/shared';

export type PresentationTone = 'sleeping' | 'active' | 'thinking' | 'approval' | 'success' | 'danger' | 'paused' | 'offline';
export interface AgentPresentation { label: string; tone: PresentationTone; isSleeping: boolean; marker: string; }

const PRESENTATION: Record<AgentState, AgentPresentation> = {
  idle: { label: 'Idle', tone: 'sleeping', isSleeping: true, marker: 'Zzz' },
  queued: { label: 'Queued', tone: 'active', isSleeping: false, marker: '!' },
  working: { label: 'Working', tone: 'active', isSleeping: false, marker: 'WORK' },
  thinking: { label: 'Thinking', tone: 'thinking', isSleeping: false, marker: '…' },
  using_tool: { label: 'Using Tool', tone: 'active', isSleeping: false, marker: 'TOOL' },
  communicating: { label: 'Communicating', tone: 'active', isSleeping: false, marker: 'CHAT' },
  waiting_approval: { label: 'Waiting Approval', tone: 'approval', isSleeping: false, marker: '?' },
  completed: { label: 'Completed', tone: 'success', isSleeping: false, marker: '✓' },
  error: { label: 'Error', tone: 'danger', isSleeping: false, marker: '!' },
  paused: { label: 'Paused', tone: 'paused', isSleeping: true, marker: 'Ⅱ' },
  offline: { label: 'Offline', tone: 'offline', isSleeping: false, marker: 'OFF' },
};
export function getAgentPresentation(state: AgentState): AgentPresentation { return PRESENTATION[state]; }
