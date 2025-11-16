/**
 * Agent Marketplace System
 * Allows users to share, discover, and purchase custom agent templates
 */

export interface MarketplaceItem {
  id: string;
  templateId: string;
  name: string;
  description: string;
  author: string;
  authorId: string;
  price: number; // 0 for free
  currency: string;
  downloads: number;
  rating: number;
  reviews: number;
  category: string;
  tags: string[];
  version: string;
  thumbnail?: string;
  screenshots: string[];
  documentation?: string;
  createdAt: Date;
  updatedAt: Date;
  featured: boolean;
}

export interface MarketplaceReview {
  id: string;
  itemId: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  helpful: number;
  createdAt: Date;
}

export interface MarketplacePurchase {
  id: string;
  itemId: string;
  userId: string;
  price: number;
  currency: string;
  status: 'pending' | 'completed' | 'refunded';
  purchasedAt: Date;
}

export class MarketplaceManager {
  private items: Map<string, MarketplaceItem> = new Map();
  private reviews: Map<string, MarketplaceReview[]> = new Map();
  private purchases: Map<string, MarketplacePurchase[]> = new Map();

  /**
   * Publish item to marketplace
   */
  publishItem(item: Omit<MarketplaceItem, 'id' | 'downloads' | 'rating' | 'reviews' | 'createdAt' | 'updatedAt' | 'featured'>): MarketplaceItem {
    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const marketplaceItem: MarketplaceItem = {
      ...item,
      id,
      downloads: 0,
      rating: 0,
      reviews: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      featured: false,
    };

    this.items.set(id, marketplaceItem);
    console.log(`Published item to marketplace: ${item.name}`);
    
    return marketplaceItem;
  }

  /**
   * Get all marketplace items
   */
  getAllItems(filters?: {
    category?: string;
    minRating?: number;
    maxPrice?: number;
    featured?: boolean;
    tags?: string[];
  }): MarketplaceItem[] {
    let items = Array.from(this.items.values());

    if (filters) {
      if (filters.category) {
        items = items.filter(i => i.category === filters.category);
      }
      if (filters.minRating !== undefined) {
        items = items.filter(i => i.rating >= filters.minRating!);
      }
      if (filters.maxPrice !== undefined) {
        items = items.filter(i => i.price <= filters.maxPrice!);
      }
      if (filters.featured !== undefined) {
        items = items.filter(i => i.featured === filters.featured);
      }
      if (filters.tags && filters.tags.length > 0) {
        items = items.filter(i => 
          filters.tags!.some(tag => i.tags.includes(tag))
        );
      }
    }

    return items.sort((a, b) => b.downloads - a.downloads);
  }

  /**
   * Get item by ID
   */
  getItem(id: string): MarketplaceItem | undefined {
    return this.items.get(id);
  }

  /**
   * Search marketplace
   */
  searchItems(query: string): MarketplaceItem[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.items.values()).filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get featured items
   */
  getFeaturedItems(limit = 10): MarketplaceItem[] {
    return Array.from(this.items.values())
      .filter(i => i.featured)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  /**
   * Get popular items
   */
  getPopularItems(limit = 10): MarketplaceItem[] {
    return Array.from(this.items.values())
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);
  }

  /**
   * Get top rated items
   */
  getTopRatedItems(limit = 10): MarketplaceItem[] {
    return Array.from(this.items.values())
      .filter(i => i.reviews > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  /**
   * Purchase item
   */
  purchaseItem(itemId: string, userId: string): MarketplacePurchase {
    const item = this.items.get(itemId);
    
    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }

    const purchase: MarketplacePurchase = {
      id: `purchase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemId,
      userId,
      price: item.price,
      currency: item.currency,
      status: 'completed',
      purchasedAt: new Date(),
    };

    // Update download count
    item.downloads++;

    // Store purchase
    const userPurchases = this.purchases.get(userId) || [];
    userPurchases.push(purchase);
    this.purchases.set(userId, userPurchases);

    console.log(`User ${userId} purchased item ${itemId}`);
    return purchase;
  }

  /**
   * Add review
   */
  addReview(itemId: string, userId: string, username: string, rating: number, comment: string): MarketplaceReview {
    const item = this.items.get(itemId);
    
    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }

    const review: MarketplaceReview = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemId,
      userId,
      username,
      rating,
      comment,
      helpful: 0,
      createdAt: new Date(),
    };

    // Store review
    const itemReviews = this.reviews.get(itemId) || [];
    itemReviews.push(review);
    this.reviews.set(itemId, itemReviews);

    // Update item rating
    const totalRating = itemReviews.reduce((sum, r) => sum + r.rating, 0);
    item.rating = totalRating / itemReviews.length;
    item.reviews = itemReviews.length;

    return review;
  }

  /**
   * Get reviews for item
   */
  getReviews(itemId: string, limit = 50): MarketplaceReview[] {
    const reviews = this.reviews.get(itemId) || [];
    return reviews.slice(-limit).reverse();
  }

  /**
   * Get user purchases
   */
  getUserPurchases(userId: string): MarketplacePurchase[] {
    return this.purchases.get(userId) || [];
  }

  /**
   * Check if user owns item
   */
  userOwnsItem(userId: string, itemId: string): boolean {
    const userPurchases = this.purchases.get(userId) || [];
    return userPurchases.some(p => p.itemId === itemId && p.status === 'completed');
  }

  /**
   * Update item
   */
  updateItem(itemId: string, updates: Partial<MarketplaceItem>): boolean {
    const item = this.items.get(itemId);
    
    if (!item) return false;

    const updated = { ...item, ...updates, updatedAt: new Date() };
    this.items.set(itemId, updated);
    return true;
  }

  /**
   * Delete item
   */
  deleteItem(itemId: string): boolean {
    return this.items.delete(itemId);
  }

  /**
   * Get marketplace statistics
   */
  getStatistics(): Record<string, any> {
    const items = Array.from(this.items.values());
    const allReviews = Array.from(this.reviews.values()).flat();
    const allPurchases = Array.from(this.purchases.values()).flat();

    return {
      totalItems: items.length,
      totalDownloads: items.reduce((sum, i) => sum + i.downloads, 0),
      totalReviews: allReviews.length,
      totalPurchases: allPurchases.length,
      totalRevenue: allPurchases
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.price, 0),
      averageRating: items.length > 0
        ? items.reduce((sum, i) => sum + i.rating, 0) / items.length
        : 0,
      categories: Array.from(new Set(items.map(i => i.category))),
    };
  }
}

// Singleton instance
let marketplaceManager: MarketplaceManager | null = null;

export function getMarketplaceManager(): MarketplaceManager {
  if (!marketplaceManager) {
    marketplaceManager = new MarketplaceManager();
  }
  return marketplaceManager;
}
