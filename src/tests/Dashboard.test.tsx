import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../../components/Dashboard';
import { FeedbackEntry } from '../../types';

describe('Dashboard Component', () => {
  const mockFeedbackHistory: FeedbackEntry[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      scenario: 'Professional',
      tone: 50,
      responseType: 'recommended',
      outcome: 'great',
    },
    {
      id: '2',
      timestamp: new Date().toISOString(),
      scenario: 'Personal',
      tone: 30,
      responseType: 'bold',
      outcome: 'okay',
    },
    {
      id: '3',
      timestamp: new Date().toISOString(),
      scenario: 'Professional',
      tone: 70,
      responseType: 'safe',
      outcome: 'bad',
    },
  ];

  it('should render without crashing', () => {
    render(<Dashboard feedbackHistory={[]} totalAnalyses={0} />);
    expect(screen.getByText('Analyses Run')).toBeInTheDocument();
  });

  it('should display correct stats', () => {
    render(<Dashboard feedbackHistory={mockFeedbackHistory} totalAnalyses={10} />);
    
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('33%')).toBeInTheDocument(); // 1 great out of 3 = 33%
    expect(screen.getByText('3')).toBeInTheDocument(); // Total feedback
  });

  it('should show empty state when no data', () => {
    render(<Dashboard feedbackHistory={[]} totalAnalyses={0} />);
    
    expect(screen.getByText('No feedback data yet')).toBeInTheDocument();
    expect(screen.getByText('No scenario data yet')).toBeInTheDocument();
  });

  it('should render stat labels correctly', () => {
    render(<Dashboard feedbackHistory={mockFeedbackHistory} totalAnalyses={5} />);
    
    expect(screen.getByText('Analyses Run')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('Total Feedback')).toBeInTheDocument();
  });

  it('should calculate 0% success rate with no great outcomes', () => {
    const noSuccessFeedback: FeedbackEntry[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        scenario: 'Professional',
        tone: 50,
        responseType: 'recommended',
        outcome: 'okay',
      },
      {
        id: '2',
        timestamp: new Date().toISOString(),
        scenario: 'Personal',
        tone: 30,
        responseType: 'bold',
        outcome: 'bad',
      },
    ];

    render(<Dashboard feedbackHistory={noSuccessFeedback} totalAnalyses={2} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
