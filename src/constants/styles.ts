export interface TattooStyle {
  id: string;
  name: string;
  image: string;
  isPro: boolean;
}

export const TATTOO_STYLES: TattooStyle[] = [
  { id: 'fine-line', name: 'İnce Çizgi', image: 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&q=80&w=200', isPro: false },
  { id: 'geometric', name: 'Geometrik', image: 'https://images.unsplash.com/photo-1562967914-01efa7e87832?auto=format&fit=crop&q=80&w=200', isPro: false },
  { id: 'chicano', name: 'Chicano', image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&q=80&w=200', isPro: true },
  { id: 'calligraphy', name: 'Kaligrafi', image: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?auto=format&fit=crop&q=80&w=200', isPro: true },
  { id: 'minimalist', name: 'Minimalist', image: 'https://images.unsplash.com/photo-1542330952-bffc55e812b2?auto=format&fit=crop&q=80&w=200', isPro: false },
  { id: 'traditional', name: 'Geleneksel', image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&q=80&w=200', isPro: false },
  { id: 'neo-traditional', name: 'Neo-Geleneksel', image: 'https://images.unsplash.com/photo-1550537687-c91072c4792d?auto=format&fit=crop&q=80&w=200', isPro: true },
  { id: 'tribal', name: 'Tribal', image: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?auto=format&fit=crop&q=80&w=200', isPro: false },
  { id: 'realism', name: 'Realizm', image: 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&q=80&w=200', isPro: true },
  { id: 'japanese', name: 'Japon', image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&q=80&w=200', isPro: true },
  { id: 'watercolor', name: 'Sulu Boya', image: 'https://images.unsplash.com/photo-1542330952-bffc55e812b2?auto=format&fit=crop&q=80&w=200', isPro: true },
  { id: 'blackwork', name: 'Blackwork', image: 'https://images.unsplash.com/photo-1562967914-01efa7e87832?auto=format&fit=crop&q=80&w=200', isPro: false },
  { id: 'sketch', name: 'Eskiz', image: 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&q=80&w=200', isPro: false },
  { id: 'trash-polka', name: 'Trash Polka', image: 'https://images.unsplash.com/photo-1550537687-c91072c4792d?auto=format&fit=crop&q=80&w=200', isPro: true },
  { id: 'dotwork', name: 'Dotwork', image: 'https://images.unsplash.com/photo-1542330952-bffc55e812b2?auto=format&fit=crop&q=80&w=200', isPro: false },
  { id: 'biomechanical', name: 'Biyomekanik', image: 'https://images.unsplash.com/photo-1562967914-01efa7e87832?auto=format&fit=crop&q=80&w=200', isPro: true },
  { id: 'portrait', name: 'Portre', image: 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&q=80&w=200', isPro: true },
  { id: 'script', name: 'Yazı', image: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?auto=format&fit=crop&q=80&w=200', isPro: false },
  { id: 'mandala', name: 'Mandala', image: 'https://images.unsplash.com/photo-1562967914-01efa7e87832?auto=format&fit=crop&q=80&w=200', isPro: false },
  { id: 'black-and-grey', name: 'Siyah & Gri', image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&q=80&w=200', isPro: false },
  { id: 'new-school', name: 'New School', image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&q=80&w=200', isPro: true },
  { id: 'surrealism', name: 'Sürrealizm', image: 'https://images.unsplash.com/photo-1550537687-c91072c4792d?auto=format&fit=crop&q=80&w=200', isPro: true },
  { id: 'ornamental', name: 'Ornamental', image: 'https://images.unsplash.com/photo-1542330952-bffc55e812b2?auto=format&fit=crop&q=80&w=200', isPro: false },
  { id: 'ignorant', name: 'Ignorant', image: 'https://images.unsplash.com/photo-1562967914-01efa7e87832?auto=format&fit=crop&q=80&w=200', isPro: false },
  { id: 'cyberpunk', name: 'Cyberpunk', image: 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&q=80&w=200', isPro: true }
];
