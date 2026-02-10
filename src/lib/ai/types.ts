export interface UserContext {
  style_primary?: string[];
  main_context?: string | null;
  preference_balance?: string | null;
  improvement_goals?: string[];
}

export interface WardrobeItemInput {
  id: string;
  category: string;
  type: string;
  color_primary: string;
  color_secondary?: string | null;
  style_tags?: string[];
  season_tags?: string[];
  image_url?: string | null;
}

export interface RatingResult {
  score: number;
  axes: {
    colors: number;
    coherence: number;
    occasion: number;
  };
  strengths: string[];
  improvements: string[];
  wardrobe_suggestions?: {
    item_id: string;
    reason: string;
  }[];
}

export interface OutfitSelection {
  top_id?: string;
  bottom_id?: string;
  shoes_id?: string;
  jacket_id?: string;
  accessory_id?: string;
  description: string;
  estimated_score: number;
  reasons: {
    top?: string;
    bottom?: string;
    shoes?: string;
  };
}

export interface GenerateOutfitParams {
  wardrobeItems: WardrobeItemInput[];
  userContext: UserContext;
  occasion?: string;
  comfortStyle?: 'comfort_first' | 'balanced' | 'style_first';
  allowNonWardrobeSuggestions?: boolean;
}

export interface AIProvider {
  name: string;
  rateOutfit(
    imageUrl: string,
    userContext: UserContext,
    wardrobeItems?: WardrobeItemInput[]
  ): Promise<RatingResult>;

  generateOutfit(params: GenerateOutfitParams): Promise<OutfitSelection>;

  renderOutfitImage(
    outfitSelection: OutfitSelection,
    wardrobeItems: WardrobeItemInput[],
    includeLabels: boolean
  ): Promise<string>; // Returns image URL or base64
}
