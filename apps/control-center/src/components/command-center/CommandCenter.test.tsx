import type { Agent } from '@oc3/shared';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CommandCenter } from './CommandCenter';

vi.mock('../world/CompanyWorldCanvas', () => ({
  CompanyWorldCanvas: ({ agents, onSelectAgent }: { agents: Agent[]; onSelectAgent: (id: string) => void }) => <div>{agents.map((agent) => <button key={agent.id} type="button" aria-label={`Select ${agent.name}`} onClick={() => onSelectAgent(agent.id)} />)}</div>,
}));

describe('CommandCenter', () => {
  it('starts on Yoda and changes the inspector when another agent is selected', () => {
    render(<CommandCenter />);
    expect(screen.getByRole('heading', { name: 'Yoda' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Select Aria' }));
    expect(screen.getByRole('heading', { name: 'Aria' })).toBeInTheDocument();
    expect(screen.getByText('Approval Agent')).toBeInTheDocument();
  });
});
