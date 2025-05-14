import { render } from '@testing-library/react';
import CenteredLoader from '../CenterLoader';
import { describe, expect, it } from 'vitest';

describe('CenteredLoader', () => {
  it('renders circular progress', () => {
    render(<CenteredLoader />);

    // CircularProgress from MUI should be present
    const circularProgress = document.querySelector(
      '.MuiCircularProgress-root'
    );
    expect(circularProgress).toBeInTheDocument();
  });

  it('has proper styling for centering', () => {
    render(<CenteredLoader />);

    const box = document.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();

    // Check if the box has the proper styling for centering
    expect(box).toHaveStyle('display: flex');
    expect(box).toHaveStyle('justify-content: center');
    expect(box).toHaveStyle('align-items: center');
  });
});
