# Threadly Testing Guide

## Running Tests

### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

### Test Files
- `src/tests/helpers.test.ts` - Utility function tests
- `src/tests/Dashboard.test.tsx` - Dashboard component tests
- `src/tests/ResponseCard.test.tsx` - ResponseCard component tests
- `src/tests/geminiService.test.ts` - API service tests

### Test Coverage
The tests cover:
- ✅ **Helper Functions**: Input validation, sanitization, formatting
- ✅ **Components**: Dashboard, ResponseCard rendering and interactions
- ✅ **Services**: Gemini API integration with mocked responses
- ✅ **Error Handling**: Validation errors, API errors
- ✅ **User Interactions**: Button clicks, form submissions

## Writing New Tests

### Component Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Service Test Example
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('My Service', () => {
  it('should handle API calls', async () => {
    const result = await myService();
    expect(result).toBeDefined();
  });
});
```

## Best Practices

1. **Keep tests simple and focused** - One test per behavior
2. **Use descriptive test names** - Clearly state what is being tested
3. **Mock external dependencies** - Don't make real API calls
4. **Test user behavior** - Not implementation details
5. **Maintain high coverage** - Aim for >80% coverage on critical paths

## Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Pull requests
- Before deployment

## Debugging Tests

```bash
# Run a specific test file
npm test src/tests/helpers.test.ts

# Run tests matching a pattern
npm test -- --grep "Dashboard"

# Run with debugging
npm test -- --inspect-brk
```
