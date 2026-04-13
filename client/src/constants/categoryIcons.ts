import {
    Home,
    ShoppingCart,
    Zap,
    Car,
    PlayCircle,
    ShoppingBag,
    UtensilsCrossed,
    Heart,
    Film,
    HelpCircle,
    type LucideProps,
} from 'lucide-react';
import type { FC } from 'react';

type IconComponent = FC<LucideProps>;

export const categoryIcons: Record<string, IconComponent> = {
    // Housing
    housing: Home,
    rent: Home,
    maintenance: Home,
    furniture: Home,

    // Groceries
    groceries: ShoppingCart,
    supermarket: ShoppingCart,
    food: ShoppingCart,
    household: ShoppingCart,
    walmart: ShoppingCart,
    costco: ShoppingCart,

    // Utilities
    utilities: Zap,
    electricity: Zap,
    water: Zap,
    gas: Zap,
    internet: Zap,
    'mobile phone': Zap,

    // Transportation
    transportation: Car,
    uber: Car,
    bus: Car,
    train: Car,
    fuel: Car,
    parking: Car,

    // Subscriptions
    subscriptions: PlayCircle,
    netflix: PlayCircle,
    spotify: PlayCircle,
    'youtube premium': PlayCircle,
    'software subscriptions': PlayCircle,

    // Shopping
    shopping: ShoppingBag,
    amazon: ShoppingBag,
    clothing: ShoppingBag,
    electronics: ShoppingBag,
    gadgets: ShoppingBag,

    // Dining / Food
    dining: UtensilsCrossed,
    'food & dining': UtensilsCrossed,
    restaurants: UtensilsCrossed,
    takeout: UtensilsCrossed,
    coffee: UtensilsCrossed,

    // Health
    health: Heart,
    medicine: Heart,
    'doctor visit': Heart,
    'gym membership': Heart,

    // Entertainment
    entertainment: Film,
    movies: Film,
    games: Film,
    events: Film,
    hobbies: Film,

    // Miscellaneous
    miscellaneous: HelpCircle,
    other: HelpCircle,
};

export const getCategoryIcon = (categoryName: string): IconComponent => {
    const normalized = categoryName.toLowerCase().trim();
    return categoryIcons[normalized] || HelpCircle;
};

export const categoryColors: Record<string, string> = {
    housing: '#3b82f6',
    groceries: '#10b981',
    utilities: '#f59e0b',
    transportation: '#ef4444',
    subscriptions: '#8b5cf6',
    shopping: '#ec4899',
    dining: '#f97316',
    health: '#06b6d4',
    entertainment: '#6366f1',
    miscellaneous: '#6b7280',
};

export const getCategoryColor = (categoryName: string): string => {
    const normalized = categoryName.toLowerCase().trim();
    for (const [key, color] of Object.entries(categoryColors)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return color;
        }
    }
    return '#6b7280'; // Default gray
};
