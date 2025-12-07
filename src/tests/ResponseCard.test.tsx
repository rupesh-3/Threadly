import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ResponseCard from '../../components/ResponseCard';
import { StrategyResponse } from '../../types';

describe('ResponseCard Component', () => {
  const mockResponse: StrategyResponse = {
    strategyType: 'recommended',
    replyText: 'This is a test response message.',
    predictedOutcome: 'They will likely respond positively.',
    riskLevel: 'low',
    riskExplanation: 'Low risk because the tone is professional.',
    reasoning: 'This approach is balanced and clear.',
    followUp: 'Wait for their response and follow up in 24 hours.',
  };

  const mockOnCopy = vi.fn();
  const mockOnSimulate = vi.fn();

  it('should render the response text', () => {
    render(
      <ResponseCard
        response={mockResponse}
        onCopy={mockOnCopy}
        onSimulate={mockOnSimulate}
      />
    );

    expect(screen.getByText('This is a test response message.')).toBeInTheDocument();
  });

  it('should display strategy type badge', () => {
    render(
      <ResponseCard
        response={mockResponse}
        onCopy={mockOnCopy}
        onSimulate={mockOnSimulate}
      />
    );

    expect(screen.getByText('RECOMMENDED')).toBeInTheDocument();
  });

  it('should display risk level', () => {
    render(
      <ResponseCard
        response={mockResponse}
        onCopy={mockOnCopy}
        onSimulate={mockOnSimulate}
      />
    );

    expect(screen.getByText(/Risk: low/i)).toBeInTheDocument();
  });

  it('should show reasoning', () => {
    render(
      <ResponseCard
        response={mockResponse}
        onCopy={mockOnCopy}
        onSimulate={mockOnSimulate}
      />
    );

    expect(screen.getByText('This approach is balanced and clear.')).toBeInTheDocument();
  });

  it('should show predicted outcome', () => {
    render(
      <ResponseCard
        response={mockResponse}
        onCopy={mockOnCopy}
        onSimulate={mockOnSimulate}
      />
    );

    expect(screen.getByText('They will likely respond positively.')).toBeInTheDocument();
  });

  it('should call onSimulate when simulate button is clicked', () => {
    render(
      <ResponseCard
        response={mockResponse}
        onCopy={mockOnCopy}
        onSimulate={mockOnSimulate}
      />
    );

    const simulateButton = screen.getByRole('button', { name: /simulate/i });
    fireEvent.click(simulateButton);

    expect(mockOnSimulate).toHaveBeenCalledTimes(1);
  });

  it('should expand and show details when details button is clicked', () => {
    render(
      <ResponseCard
        response={mockResponse}
        onCopy={mockOnCopy}
        onSimulate={mockOnSimulate}
      />
    );

    const detailsButton = screen.getByRole('button', { name: /Show additional details/i });
    fireEvent.click(detailsButton);

    expect(screen.getByText('Low risk because the tone is professional.')).toBeInTheDocument();
    expect(screen.getByText('Wait for their response and follow up in 24 hours.')).toBeInTheDocument();
  });

  it('should render different strategy types correctly', () => {
    const boldResponse: StrategyResponse = {
      ...mockResponse,
      strategyType: 'bold',
    };

    const { rerender } = render(
      <ResponseCard
        response={boldResponse}
        onCopy={mockOnCopy}
        onSimulate={mockOnSimulate}
      />
    );

    expect(screen.getByText('BOLD')).toBeInTheDocument();

    const safeResponse: StrategyResponse = {
      ...mockResponse,
      strategyType: 'safe',
    };

    rerender(
      <ResponseCard
        response={safeResponse}
        onCopy={mockOnCopy}
        onSimulate={mockOnSimulate}
      />
    );

    expect(screen.getByText('SAFE')).toBeInTheDocument();
  });
});
