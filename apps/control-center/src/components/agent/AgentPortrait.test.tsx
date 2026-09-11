import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AgentPortrait } from './AgentPortrait';

describe('AgentPortrait', () => {
  it('renders the selected agent with its own RPG hair silhouette', () => {
    const { rerender } = render(<AgentPortrait agentId="aria" />);
    expect(screen.getByTestId('agent-portrait')).toHaveAttribute('data-hair-style', 'high-ponytail');

    rerender(<AgentPortrait agentId="bb8" />);
    expect(screen.getByTestId('agent-portrait')).toHaveAttribute('data-hair-style', 'soft-spiky');
  });
});
