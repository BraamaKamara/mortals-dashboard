import React from 'react';
import { render, screen } from '@testing-library/react';
import DailyWeeklyJars from './DailyWeeklyJars_canonical';

test('renders Day, Week, and Year progress sections', () => {
  render(<DailyWeeklyJars />);
  // Component now shows "Day Progress", "Week Progress", "Year Progress"
  expect(screen.getByText(/Day Progress/i)).toBeInTheDocument();
  expect(screen.getByText(/Week Progress/i)).toBeInTheDocument();
  expect(screen.getByText(/Year Progress/i)).toBeInTheDocument();
});
