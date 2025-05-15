import { 
  users, type User, type InsertUser,
  templates, type Template, type InsertTemplate,
  adAccounts, type AdAccount, type InsertAdAccount,
  ads, type Ad, type InsertAd, type UpdateAdStatus,
  adSets, type AdSet, type InsertAdSet
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Template operations
  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  
  // Ad Account operations
  getAdAccounts(): Promise<AdAccount[]>;
  getAdAccount(id: number): Promise<AdAccount | undefined>;
  createAdAccount(adAccount: InsertAdAccount): Promise<AdAccount>;
  
  // Ad operations
  getAds(): Promise<Ad[]>;
  getAd(id: number): Promise<Ad | undefined>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAdStatus(updateData: UpdateAdStatus): Promise<Ad | undefined>;
  updateAdMetaId(id: number, metaAdId: string): Promise<Ad | undefined>;
  
  // Ad Set operations
  getAdSets(): Promise<AdSet[]>;
  getAdSetsByAdId(adId: number): Promise<AdSet[]>;
  createAdSet(adSet: InsertAdSet): Promise<AdSet>;
  updateAdSetMetaId(id: number, metaAdSetId: string): Promise<AdSet | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private templates: Map<number, Template>;
  private adAccounts: Map<number, AdAccount>;
  private ads: Map<number, Ad>;
  private adSets: Map<number, AdSet>;
  
  private currentUserId: number;
  private currentTemplateId: number;
  private currentAdAccountId: number;
  private currentAdId: number;
  private currentAdSetId: number;

  constructor() {
    this.users = new Map();
    this.templates = new Map();
    this.adAccounts = new Map();
    this.ads = new Map();
    this.adSets = new Map();
    
    this.currentUserId = 1;
    this.currentTemplateId = 1;
    this.currentAdAccountId = 1;
    this.currentAdId = 1;
    this.currentAdSetId = 1;
    
    // Initialize with default templates
    this.createTemplate({
      name: "Standard Ad",
      imageUrl: "https://images.unsplash.com/photo-1611926653458-09294b3142bf",
    });
    
    this.createTemplate({
      name: "Carousel",
      imageUrl: "https://images.unsplash.com/photo-1557838923-2985c318be48",
    });
    
    this.createTemplate({
      name: "Collection",
      imageUrl: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a",
    });
    
    // Initialize with default ad accounts
    this.createAdAccount({
      accountId: "1234567890",
      name: "Main Business Account",
    });
    
    this.createAdAccount({
      accountId: "0987654321",
      name: "Secondary Account",
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Template operations
  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }
  
  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }
  
  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = this.currentTemplateId++;
    const template: Template = { ...insertTemplate, id };
    this.templates.set(id, template);
    return template;
  }
  
  // Ad Account operations
  async getAdAccounts(): Promise<AdAccount[]> {
    return Array.from(this.adAccounts.values());
  }
  
  async getAdAccount(id: number): Promise<AdAccount | undefined> {
    return this.adAccounts.get(id);
  }
  
  async createAdAccount(insertAdAccount: InsertAdAccount): Promise<AdAccount> {
    const id = this.currentAdAccountId++;
    const adAccount: AdAccount = { ...insertAdAccount, id };
    this.adAccounts.set(id, adAccount);
    return adAccount;
  }
  
  // Ad operations
  async getAds(): Promise<Ad[]> {
    return Array.from(this.ads.values());
  }
  
  async getAd(id: number): Promise<Ad | undefined> {
    return this.ads.get(id);
  }
  
  async createAd(insertAd: InsertAd): Promise<Ad> {
    const id = this.currentAdId++;
    const createdAt = new Date();
    const ad: Ad = { 
      ...insertAd, 
      id, 
      createdAt, 
      publishedAt: null, 
      metaAdId: null,
      statistics: {}
    };
    this.ads.set(id, ad);
    return ad;
  }
  
  async updateAdStatus(updateData: UpdateAdStatus): Promise<Ad | undefined> {
    const ad = await this.getAd(updateData.id);
    if (!ad) return undefined;
    
    const updatedAd: Ad = { 
      ...ad, 
      status: updateData.status,
      publishedAt: updateData.status === 'published' ? new Date() : ad.publishedAt
    };
    
    this.ads.set(updateData.id, updatedAd);
    return updatedAd;
  }
  
  async updateAdMetaId(id: number, metaAdId: string): Promise<Ad | undefined> {
    const ad = await this.getAd(id);
    if (!ad) return undefined;
    
    const updatedAd: Ad = { ...ad, metaAdId };
    this.ads.set(id, updatedAd);
    return updatedAd;
  }
  
  // Ad Set operations
  async getAdSets(): Promise<AdSet[]> {
    return Array.from(this.adSets.values());
  }
  
  async getAdSetsByAdId(adId: number): Promise<AdSet[]> {
    return Array.from(this.adSets.values()).filter(adSet => adSet.adId === adId);
  }
  
  async createAdSet(insertAdSet: InsertAdSet): Promise<AdSet> {
    const id = this.currentAdSetId++;
    const createdAt = new Date();
    const adSet: AdSet = { 
      ...insertAdSet, 
      id, 
      createdAt, 
      publishedAt: null,
      metaAdSetId: null
    };
    this.adSets.set(id, adSet);
    return adSet;
  }
  
  async updateAdSetMetaId(id: number, metaAdSetId: string): Promise<AdSet | undefined> {
    const adSet = this.adSets.get(id);
    if (!adSet) return undefined;
    
    const updatedAdSet: AdSet = { ...adSet, metaAdSetId };
    this.adSets.set(id, updatedAdSet);
    return updatedAdSet;
  }
}

export const storage = new MemStorage();
