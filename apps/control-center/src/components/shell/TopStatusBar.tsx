import type { Agent } from '@oc3/shared';
interface TopStatusBarProps { agents: Agent[]; }
export function TopStatusBar({ agents }: TopStatusBarProps) {
  const active = agents.filter((agent) => ['working', 'thinking', 'using_tool', 'communicating'].includes(agent.state)).length;
  const sleeping = agents.filter((agent) => agent.state === 'idle').length;
  return <header className="topbar"><div className="brand-block"><div className="brand-logo">OC3</div><div className="brand-copy">PEOPLE<br />AGENTS<br />IDEAS</div></div><div className="topbar-slogan">SMALL AGENTS. A BRIGHTER TOMORROW.</div><div className="topbar-metrics"><div className="system-pill"><span className="online-dot" /> SYSTEM ONLINE</div><div className="metric"><span>{agents.length}</span><small>AGENTS</small></div><div className="metric"><span>{active}</span><small>ACTIVE</small></div><div className="metric"><span>{sleeping}</span><small>SLEEPING</small></div><div className="seeded-pill">PHASE 1 · SEEDED</div></div></header>;
}
