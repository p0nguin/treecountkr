import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertTreeSchema } from "@shared/schema";
import { setupAuth, isAuthenticated, requireRole } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all trees
  app.get("/api/trees", async (req, res) => {
    try {
      const { species, condition, search } = req.query;
      
      let trees;
      if (search) {
        trees = await storage.searchTrees(search as string);
      } else if (species) {
        trees = await storage.getTreesBySpecies(species as string);
      } else if (condition) {
        trees = await storage.getTreesByCondition(condition as string);
      } else {
        trees = await storage.getAllTrees();
      }
      
      res.json(trees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trees" });
    }
  });

  // Get single tree
  app.get("/api/trees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tree = await storage.getTree(id);
      
      if (!tree) {
        return res.status(404).json({ message: "Tree not found" });
      }
      
      res.json(tree);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tree" });
    }
  });

  // Create new tree
  app.post("/api/trees", async (req, res) => {
    try {
      const validatedData = insertTreeSchema.parse(req.body);
      const tree = await storage.createTree(validatedData);
      res.status(201).json(tree);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tree data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tree" });
    }
  });

  // Get tree statistics
  app.get("/api/trees/stats/overview", async (req, res) => {
    try {
      const trees = await storage.getAllTrees();
      
      const totalTrees = trees.length;
      const species = new Set(trees.map(t => t.species)).size;
      const contributors = new Set(trees.map(t => t.contributor)).size;
      const healthyTrees = trees.filter(t => t.condition === 'excellent').length;
      const healthyPercentage = totalTrees > 0 ? Math.round((healthyTrees / totalTrees) * 100) : 0;
      
      const speciesDistribution = trees.reduce((acc, tree) => {
        acc[tree.species] = (acc[tree.species] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const conditionDistribution = trees.reduce((acc, tree) => {
        acc[tree.condition] = (acc[tree.condition] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      res.json({
        totalTrees,
        species,
        contributors,
        healthyPercentage,
        speciesDistribution,
        conditionDistribution,
        recentTrees: trees.slice(0, 5)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
