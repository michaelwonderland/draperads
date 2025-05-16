import { 
  users, type User, type InsertUser,
  templates, type Template, type InsertTemplate,
  adAccounts, type AdAccount, type InsertAdAccount,
  ads, type Ad, type InsertAd, type UpdateAdStatus,
  adSets, type AdSet, type InsertAdSet
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Template operations
  async getTemplates(): Promise<Template[]> {
    return db.select().from(templates);
  }
  
  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }
  
  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db.insert(templates).values(insertTemplate).returning();
    return template;
  }
  
  // Ad Account operations
  async getAdAccounts(): Promise<AdAccount[]> {
    return db.select().from(adAccounts);
  }
  
  async getAdAccount(id: number): Promise<AdAccount | undefined> {
    const [adAccount] = await db.select().from(adAccounts).where(eq(adAccounts.id, id));
    return adAccount;
  }
  
  async createAdAccount(insertAdAccount: InsertAdAccount): Promise<AdAccount> {
    const [adAccount] = await db.insert(adAccounts).values(insertAdAccount).returning();
    return adAccount;
  }
  
  // Ad operations
  async getAds(): Promise<Ad[]> {
    return db.select().from(ads);
  }
  
  async getAd(id: number): Promise<Ad | undefined> {
    const [ad] = await db.select().from(ads).where(eq(ads.id, id));
    return ad;
  }
  
  async createAd(insertAd: InsertAd): Promise<Ad> {
    const [ad] = await db
      .insert(ads)
      .values({
        ...insertAd,
        status: insertAd.status || "draft",
        statistics: {}
      })
      .returning();
    return ad;
  }
  
  async updateAdStatus(updateData: UpdateAdStatus): Promise<Ad | undefined> {
    const [ad] = await db
      .update(ads)
      .set({
        status: updateData.status,
        publishedAt: updateData.status === 'published' ? new Date() : undefined
      })
      .where(eq(ads.id, updateData.id))
      .returning();
    return ad;
  }
  
  async updateAdMetaId(id: number, metaAdId: string): Promise<Ad | undefined> {
    const [ad] = await db
      .update(ads)
      .set({ metaAdId })
      .where(eq(ads.id, id))
      .returning();
    return ad;
  }
  
  // Ad Set operations
  async getAdSets(): Promise<AdSet[]> {
    return db.select().from(adSets);
  }
  
  async getAdSetsByAdId(adId: number): Promise<AdSet[]> {
    return db.select().from(adSets).where(eq(adSets.adId, adId));
  }
  
  async createAdSet(insertAdSet: InsertAdSet): Promise<AdSet> {
    const [adSet] = await db
      .insert(adSets)
      .values(insertAdSet)
      .returning();
    return adSet;
  }
  
  async updateAdSetMetaId(id: number, metaAdSetId: string): Promise<AdSet | undefined> {
    const [adSet] = await db
      .update(adSets)
      .set({ metaAdSetId })
      .where(eq(adSets.id, id))
      .returning();
    return adSet;
  }
}

// Initialize sample data function
async function initializeSampleData() {
  try {
    // Check if templates exist
    const templatesList = await db.select().from(templates);
    if (templatesList.length === 0) {
      await db.insert(templates).values([
        {
          name: "Standard Ad",
          imageUrl: "https://images.unsplash.com/photo-1611926653458-09294b3142bf",
        },
        {
          name: "Carousel",
          imageUrl: "https://images.unsplash.com/photo-1557838923-2985c318be48",
        },
        {
          name: "Collection",
          imageUrl: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a",
        }
      ]);
    }
    
    // Check if ad accounts exist
    const accountsList = await db.select().from(adAccounts);
    if (accountsList.length === 0) {
      await db.insert(adAccounts).values([
        {
          accountId: "1234567890",
          name: "Main Business Account",
        },
        {
          accountId: "0987654321",
          name: "Secondary Account",
        }
      ]);
    }
    
    console.log("Sample data initialized successfully");
  } catch (error) {
    console.error("Error initializing sample data:", error);
  }
}

// Initialize data and export storage instance
setTimeout(() => {
  initializeSampleData().catch(console.error);
}, 1000);
export const storage = new DatabaseStorage();
