import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../Footer';
import { describe, expect } from 'vitest';

describe('Footer', () => {
  it('renders copyright text', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    // Check for copyright text
    expect(screen.getByText(/Copyright ©/i)).toBeInTheDocument();
  });

  it('renders current year', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    // Check that the current year is displayed
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });

  it('renders app name link', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    // Check for the app name link
    const appNameLink = screen.getByText('Job Listing Platform');
    expect(appNameLink).toBeInTheDocument();
    expect(appNameLink.tagName.toLowerCase()).toBe('a');
    expect(appNameLink).toHaveAttribute('href', '/');
  });
});
