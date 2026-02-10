import {
  AIProvider,
  RatingResult,
  OutfitSelection,
  UserContext,
  WardrobeItemInput,
  GenerateOutfitParams,
} from './types';

// Simple hash function for deterministic but varied results
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

const STRENGTHS_POOL = [
  'Les couleurs se complètent bien 👌',
  'Bon équilibre entre les pièces',
  'Style cohérent, bien joué',
  'Les proportions fonctionnent bien',
  'Mix casual/stylé réussi',
  'Bonne harmonie générale 🔥',
];

const IMPROVEMENTS_POOL = [
  'Essaie des couleurs plus variées',
  'Les chaussures pourraient mieux matcher',
  'Un layering pourrait ajouter du style',
  'Teste un accessoire pour élever le look',
  'Les proportions pourraient être ajustées',
  'Une pièce statement ferait la diff',
];

const OUTFIT_DESCRIPTIONS = [
  'Look simple et efficace',
  'Vibe chill et décontracté',
  'Stylé sans en faire trop',
  'Propre et bien pensé',
  'Équilibré et cohérent',
  'Look qui tue, nickel',
];

export class MockAIProvider implements AIProvider {
  name = 'mock';

  async rateOutfit(
    imageUrl: string,
    userContext: UserContext,
    wardrobeItems?: WardrobeItemInput[]
  ): Promise<RatingResult> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const hash = simpleHash(imageUrl);
    const score = 60 + (hash % 35); // Score between 60-95

    // Pick deterministic strengths and improvements
    const strengthIndices = [hash % 6, (hash + 1) % 6];
    const improvementIndices = [(hash + 2) % 6, (hash + 3) % 6];

    const result: RatingResult = {
      score,
      axes: {
        colors: 65 + (hash % 30),
        coherence: 70 + ((hash + 5) % 25),
        occasion: 60 + ((hash + 10) % 35),
      },
      strengths: [
        STRENGTHS_POOL[strengthIndices[0]],
        STRENGTHS_POOL[strengthIndices[1]],
      ],
      improvements: [
        IMPROVEMENTS_POOL[improvementIndices[0]],
        IMPROVEMENTS_POOL[improvementIndices[1]],
      ],
    };

    // Add wardrobe suggestions if items provided
    if (wardrobeItems && wardrobeItems.length > 0) {
      const suggestedItems = wardrobeItems
        .filter((item) => item.category === 'shoes' || item.category === 'top')
        .slice(0, 2);

      result.wardrobe_suggestions = suggestedItems.map((item) => ({
        item_id: item.id,
        reason: `Essaie avec ${item.type} ${item.color_primary}`,
      }));
    }

    return result;
  }

  async generateOutfit(params: GenerateOutfitParams): Promise<OutfitSelection> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const { wardrobeItems, occasion } = params;

    // Group items by category
    const tops = wardrobeItems.filter((i) => i.category === 'top');
    const bottoms = wardrobeItems.filter((i) => i.category === 'bottom');
    const shoes = wardrobeItems.filter((i) => i.category === 'shoes');

    // Select items (simple algorithm)
    const selectedTop = tops[Math.floor(Math.random() * tops.length)];
    const selectedBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
    const selectedShoes = shoes[Math.floor(Math.random() * shoes.length)];

    const hash = simpleHash(occasion || 'default');
    const score = 70 + (hash % 25);

    const description = OUTFIT_DESCRIPTIONS[hash % OUTFIT_DESCRIPTIONS.length];

    return {
      top_id: selectedTop?.id,
      bottom_id: selectedBottom?.id,
      shoes_id: selectedShoes?.id,
      description,
      estimated_score: score,
      reasons: {
        top: selectedTop ? `${selectedTop.type} ${selectedTop.color_primary} pour la base` : undefined,
        bottom: selectedBottom ? `${selectedBottom.type} ${selectedBottom.color_primary} bien assorti` : undefined,
        shoes: selectedShoes ? `${selectedShoes.type} qui complètent le look` : undefined,
      },
    };
  }

  async renderOutfitImage(
    outfitSelection: OutfitSelection,
    wardrobeItems: WardrobeItemInput[],
    includeLabels: boolean
  ): Promise<string> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Return a placeholder SVG as base64
    // In a real implementation, this would generate an actual image
    const svg = `
      <svg width="300" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="600" fill="#f5f5f5"/>

        <!-- Top -->
        <rect x="75" y="50" width="150" height="120" fill="#333" rx="10"/>
        ${includeLabels ? '<text x="150" y="180" text-anchor="middle" font-size="12" fill="#666">Haut</text>' : ''}

        <!-- Bottom -->
        <rect x="75" y="200" width="150" height="180" fill="#1a5fb4" rx="10"/>
        ${includeLabels ? '<text x="150" y="390" text-anchor="middle" font-size="12" fill="#666">Bas</text>' : ''}

        <!-- Shoes -->
        <rect x="75" y="410" width="150" height="80" fill="#fff" stroke="#333" stroke-width="2" rx="10"/>
        ${includeLabels ? '<text x="150" y="510" text-anchor="middle" font-size="12" fill="#666">Chaussures</text>' : ''}

        ${includeLabels ? '<text x="150" y="560" text-anchor="middle" font-size="14" font-weight="bold" fill="#0ea5e9">FitChek</text>' : ''}
      </svg>
    `;

    // For React Native, use URI encoding instead of base64
    const encodedSvg = encodeURIComponent(svg);
    return `data:image/svg+xml,${encodedSvg}`;
  }
}

export const mockProvider = new MockAIProvider();
