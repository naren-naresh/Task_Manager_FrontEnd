import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extends Vitest's expect method with DOM matchers like toBeInTheDocument()
expect.extend(matchers);

// Automatically clean up the DOM after every test to prevent memory leaks
afterEach(() => {
  cleanup();
});