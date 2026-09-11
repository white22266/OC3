import type { Agent } from '@oc3/shared';

interface TopStatusBarProps { agents: Agent[]; }

export function TopStatusBar({ agents }: TopStatusBarProps) {
  const active = agents.filter((agent) => ['working', 'thinking', 'using_tool', 'communicating'].includes(agent.state)).length;
  const sleeping = agents.filter((agent) => agent.state === 'idle').length;

  return <header className="topbar">
    <div className="brand-block">
      <div className="brand-logo">OC3</div>
      <div className="brand-copy">PEOPLE<br />AGENTS<br />IDEAS<br /><span>FOR A BRIGHTER TOMORROW</span></div>
    </div>
    <div className="topbar-slogan">SMALL AGENTS. A BRIGHTER TOMORROW.</div>
    <div className="hud-right">
      <div className="system-card">
        <div className="system-pill"><span className="online-dot" /> SYSTEM STATUS <strong>ONLINE</strong></div>
        <div className="system-mini">{agents.length} AGENTS · {active} ACTIVE · {sleeping} SLEEPING</div>
      </div>
      <div className="clock-card" aria-label="Phase 1 preview clock">
        <span className="calendar-glyph" aria-hidden="true">▦</span>
        <div><small>PHASE 1</small><strong>SEEDED</strong></div>
      </div>
      <div className="hud-mantra">BUILD<br />AUTOMATE<br />COLLABORATE<br />GROW</div>
    </div>
  </header>;
}
