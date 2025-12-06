import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders app with auth gate', async () => {
  render(<App />);
  // App now renders AuthGate first, which shows MORTALS branding after animation
  await waitFor(() => {
    expect(screen.getByText(/MORTALS/i)).toBeInTheDocument();
  });
});
