import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EternalBoard from './EternalBoard';

// Basic smoke tests for the Eternal Board interactions

describe('EternalBoard', () => {
  beforeEach(() => {
    // Isolate storage between tests
    window.localStorage.clear();
  });

  it('opens overlay when clicking the floating button', async () => {
    render(<EternalBoard />);
    const openBtn = screen.getByText(/Eternal Board/i);
    fireEvent.click(openBtn);
    expect(await screen.findByText(/Leave a dictum/i)).toBeInTheDocument();
  });

  it('creates a new dictum', async () => {
    render(<EternalBoard />);
    fireEvent.click(screen.getByText(/Eternal Board/i));

    const textarea = await screen.findByPlaceholderText(/I believe that/i);
    fireEvent.change(textarea, { target: { value: 'Memento mori. Choose wisely.' } });
    fireEvent.click(screen.getByText(/Post Dictum/i));

    await waitFor(() => {
      expect(screen.getByText(/Memento mori. Choose wisely./i)).toBeInTheDocument();
    });
  });
});
