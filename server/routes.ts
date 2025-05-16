import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  insertAdSchema, 
  insertAdSetSchema, 
  updateAdStatusSchema,
  publishAdRequestSchema,
} from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage1,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  await setupAuth(app);
  
  // Auth user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = parseInt(req.user.claims.sub);
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Serve uploads
  app.use('/uploads', express.static(uploadDir));
  
  // Templates endpoints
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });
  
  // Ad Accounts endpoints
  app.get("/api/ad-accounts", async (req, res) => {
    try {
      const adAccounts = await storage.getAdAccounts();
      res.json(adAccounts);
    } catch (error) {
      console.error("Error fetching ad accounts:", error);
      res.status(500).json({ message: "Failed to fetch ad accounts" });
    }
  });
  
  // Ads endpoints
  app.get("/api/ads", async (req, res) => {
    try {
      const ads = await storage.getAds();
      res.json(ads);
    } catch (error) {
      console.error("Error fetching ads:", error);
      res.status(500).json({ message: "Failed to fetch ads" });
    }
  });
  
  app.get("/api/ads/:id", async (req, res) => {
    try {
      const adId = parseInt(req.params.id);
      if (isNaN(adId)) {
        return res.status(400).json({ message: "Invalid ad ID" });
      }
      
      const ad = await storage.getAd(adId);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }
      
      res.json(ad);
    } catch (error) {
      console.error("Error fetching ad:", error);
      res.status(500).json({ message: "Failed to fetch ad" });
    }
  });
  
  // Upload media for ad
  app.post("/api/upload", upload.single('media'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const filePath = `/uploads/${req.file.filename}`;
      const fullPath = path.join(process.cwd(), 'uploads', req.file.filename);
      
      // If it's an image, analyze it for ad copy suggestions
      let suggestions = {
        suggestedHeadline: '',
        suggestedPrimaryText: '',
        suggestedDescription: '',
        suggestedCta: 'learn_more'
      };
      
      if (req.file.mimetype.startsWith('image/')) {
        try {
          // Import without using require or dynamic import
          const { analyzeImage } = await import('./api/image-analysis.js');
          suggestions = await analyzeImage(fullPath);
        } catch (analyzeError) {
          console.error('Error analyzing image:', analyzeError);
          // Continue without suggestions if analysis fails
        }
      }
      
      res.json({ 
        url: filePath,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        ...suggestions
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });
  
  // Create new ad
  app.post("/api/ads", async (req, res) => {
    try {
      const validatedData = insertAdSchema.parse(req.body);
      const ad = await storage.createAd(validatedData);
      res.status(201).json(ad);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid ad data", 
          errors: error.errors 
        });
      }
      console.error("Error creating ad:", error);
      res.status(500).json({ message: "Failed to create ad" });
    }
  });
  
  // Update ad status
  app.patch("/api/ads/:id/status", async (req, res) => {
    try {
      const adId = parseInt(req.params.id);
      if (isNaN(adId)) {
        return res.status(400).json({ message: "Invalid ad ID" });
      }
      
      const validatedData = updateAdStatusSchema.parse({
        id: adId,
        status: req.body.status
      });
      
      const updatedAd = await storage.updateAdStatus(validatedData);
      if (!updatedAd) {
        return res.status(404).json({ message: "Ad not found" });
      }
      
      res.json(updatedAd);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid status data", 
          errors: error.errors 
        });
      }
      console.error("Error updating ad status:", error);
      res.status(500).json({ message: "Failed to update ad status" });
    }
  });
  
  // Ad Sets endpoints
  app.get("/api/ad-sets", async (req, res) => {
    try {
      const adId = req.query.adId ? parseInt(req.query.adId as string) : undefined;
      
      let adSets;
      if (adId && !isNaN(adId)) {
        adSets = await storage.getAdSetsByAdId(adId);
      } else {
        adSets = await storage.getAdSets();
      }
      
      res.json(adSets);
    } catch (error) {
      console.error("Error fetching ad sets:", error);
      res.status(500).json({ message: "Failed to fetch ad sets" });
    }
  });
  
  // Create ad set
  app.post("/api/ad-sets", async (req, res) => {
    try {
      const validatedData = insertAdSetSchema.parse(req.body);
      const adSet = await storage.createAdSet(validatedData);
      res.status(201).json(adSet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid ad set data", 
          errors: error.errors 
        });
      }
      console.error("Error creating ad set:", error);
      res.status(500).json({ message: "Failed to create ad set" });
    }
  });
  
  // Publish ad to Meta (protected route, requires authentication)
  app.post("/api/publish", isAuthenticated, async (req, res) => {
    try {
      // Validate request data
      const validatedData = publishAdRequestSchema.parse(req.body);
      
      // Get the ad
      const ad = await storage.getAd(validatedData.adId);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }
      
      // Create ad set with the provided data
      const adSet = await storage.createAdSet(validatedData.adSetData);
      
      // In a real implementation, this would connect to Meta Marketing API
      // For this demo, we'll simulate a successful API call
      const simulatedMetaResponse = {
        id: `meta_ad_${Date.now()}`,
        adset_id: `meta_adset_${Date.now()}`,
        status: "ACTIVE"
      };
      
      // Update ad with Meta ID and published status
      await storage.updateAdMetaId(ad.id, simulatedMetaResponse.id);
      await storage.updateAdStatus({ id: ad.id, status: "active" });
      
      // Update ad set with Meta ID
      await storage.updateAdSetMetaId(adSet.id, simulatedMetaResponse.adset_id);
      
      res.status(200).json({
        success: true,
        ad: await storage.getAd(ad.id),
        adSet,
        metaResponse: simulatedMetaResponse
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid publish data", 
          errors: error.errors 
        });
      }
      console.error("Error publishing ad:", error);
      res.status(500).json({ 
        message: "Failed to publish ad", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import express from "express";
