import { AIProvider } from './types';
import { mockProvider } from './mockProvider';

// Get AI provider based on environment configuration
function getAIProvider(): AIProvider {
  const providerType = process.env.EXPO_PUBLIC_AI_PROVIDER || 'mock';

  switch (providerType.toLowerCase()) {
    case 'openai':
      // TODO: Implement OpenAI provider
      console.warn('OpenAI provider not implemented yet, falling back to mock');
      return mockProvider;

    case 'anthropic':
      // TODO: Implement Anthropic provider
      console.warn('Anthropic provider not implemented yet, falling back to mock');
      return mockProvider;

    case 'replicate':
      // TODO: Implement Replicate provider
      console.warn('Replicate provider not implemented yet, falling back to mock');
      return mockProvider;

    case 'mock':
    default:
      return mockProvider;
  }
}

export const aiProvider = getAIProvider();

// Re-export types for convenience
export * from './types';
