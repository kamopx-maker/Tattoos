export type SubscriptionTier = 'free' | 'pro' | 'studio';

export interface TattooProject {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultUrl?: string;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  tier: SubscriptionTier;
  credits: number;
}
