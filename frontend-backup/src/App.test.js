import { render, screen } from '@testing-library/react';
import App from './App';

test('renders AutoReach header', () => {
  render(<App />);
  const headerElement = screen.getByText(/AutoReach/i);
  expect(headerElement).toBeInTheDocument();
});
