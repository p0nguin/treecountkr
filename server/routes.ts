import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertTreeSchema, insertBadgeSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookie from "cookie"; // 상단에 import 필요



const JWT_SECRET = process.env.JWT_SECRET || "development-secret";



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const upload = multer({ dest: "uploads/" });

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  // await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      // const userId = req.user.claims.sub;
      // const user = await storage.getUser(userId);
      // if (!user) {
      //   return res.status(404).json({ message: "User not found" });
      // }
      
      // // Get user badges
      // const userBadges = await storage.getUserBadges(userId);
      // const userTrees = await storage.getTreesByUser(userId);
      
      // res.json({
      //   ...user,
      //   badges: userBadges,
      //   treeCount: userTrees.length,
      //   approvedTreeCount: userTrees.filter(t => t.status === "approved").length,
      // });
      res.status(200).json({ message: "Authentication temporarily disabled" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all trees (approved only for regular users)
  app.get("/api/trees", async (req, res) => {
    try {
      const { search, species, condition, status } = req.query;
      
      let trees;
      if (search) {
        trees = await storage.searchTrees(search as string);
      } else if (status) {
        trees = await storage.getTreesByStatus(status as string);
      } else {
        trees = await storage.getAllTrees();
      }
      
      // Filter by species and condition if specified
      if (species && species !== "") {
        trees = trees.filter(tree => tree.species === species);
      }
      if (condition && condition !== "") {
        trees = trees.filter(tree => tree.condition === condition);
      }
      
      // Show only approved trees for non-authenticated users
      // const user = (req as any).user;
      // if (!user) {
      //   trees = trees.filter(tree => tree.status === "approved");
      // }
      
      res.json(trees);
    } catch (error) {
      console.error("Error fetching trees:", error);
      res.status(500).json({ error: "Failed to fetch trees" });
    }
  });

  // Get user's trees
  app.get("/api/users/:userId/trees", async (req, res) => {
    try {
      const userId = req.params.userId;
      // const currentUser = (req as any).user;
      
      // Users can only see their own trees unless they're admin/supervisor
      // if (currentUser.claims.sub !== userId) {
      //   const dbUser = await storage.getUser(currentUser.claims.sub);
      //   if (!dbUser || !["admin", "supervisor"].includes(dbUser.role || "user")) {
      //     return res.status(403).json({ error: "Forbidden" });
      //   }
      // }
      
      const trees = await storage.getTreesByUser(userId);
      res.json(trees);
    } catch (error) {
      console.error("Error fetching user trees:", error);
      res.status(500).json({ error: "Failed to fetch user trees" });
    }
  });

  // Get tree by ID
  app.get("/api/trees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tree = await storage.getTree(id);
      
      if (!tree) {
        return res.status(404).json({ error: "Tree not found" });
      }
      
      res.json(tree);
    } catch (error) {
      console.error("Error fetching tree:", error);
      res.status(500).json({ error: "Failed to fetch tree" });
    }
  });

  // Create a new tree (authenticated users only)
  app.post("/api/trees", upload.single("photo"), async (req, res) => {
    try {
      // const userId = (req as any).user.claims.sub;
      const treeData = insertTreeSchema.parse({
        ...req.body,
        contributorId: "temp_user", // Temporarily assign a user ID
        photoUrl: req.file ? `/uploads/${req.file.filename}` : undefined, // Save photo URL
      });
      
      const tree = await storage.createTree(treeData);
      res.status(201).json(tree);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid tree data", details: error.errors });
      }
      console.error("Error creating tree:", error);
      res.status(500).json({ error: "Failed to create tree" });
    }
  });

  // Serve uploaded photos
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  // Review tree (supervisors and admins only)
  app.patch("/api/trees/:id/review", async (req, res) => {
    try {
      const treeId = parseInt(req.params.id);
      const { status, notes } = req.body;
      // const reviewerId = (req as any).user.claims.sub;
      
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      await storage.updateTreeStatus(treeId, status, "temp_reviewer", notes);
      res.json({ message: "Tree review updated" });
    } catch (error) {
      console.error("Error reviewing tree:", error);
      res.status(500).json({ error: "Failed to review tree" });
    }
  });

  // Get pending trees for review (supervisors and admins only)
  app.get("/api/trees/pending", async (req, res) => {
    try {
      const pendingTrees = await storage.getTreesByStatus("pending");
      res.json(pendingTrees);
    } catch (error) {
      console.error("Error fetching pending trees:", error);
      res.status(500).json({ error: "Failed to fetch pending trees" });
    }
  });

  // Get tree statistics
  app.get("/api/trees/stats/overview", async (req, res) => {
    try {
      const stats = await storage.getTreeStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching tree statistics:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Badge routes
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  app.post("/api/badges", async (req, res) => {
    try {
      const badgeData = insertBadgeSchema.parse(req.body);
      const badge = await storage.createBadge(badgeData);
      res.status(201).json(badge);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid badge data", details: error.errors });
      }
      console.error("Error creating badge:", error);
      res.status(500).json({ error: "Failed to create badge" });
    }
  });

  // Get user badges
  app.get("/api/users/:userId/badges", async (req, res) => {
    try {
      const userId = req.params.userId;
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ error: "Failed to fetch user badges" });
    }
  });

  // Award badge (admins only)
  app.post("/api/users/:userId/badges/:badgeId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const badgeId = parseInt(req.params.badgeId);
      
      await storage.awardBadge(userId, badgeId);
      res.json({ message: "Badge awarded successfully" });
    } catch (error) {
      console.error("Error awarding badge:", error);
      res.status(500).json({ error: "Failed to award badge" });
    }
  });

  // Manually award education badge (for testing/admin purposes)
  app.post("/api/admin/award-education-badge/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      // Ensure the user exists before trying to award a badge
      let user = await storage.getUser(userId);
      if (!user) {
        // Create a dummy user if not found (for testing purposes)
        user = await storage.upsertUser({ id: userId, email: `${userId}@example.com`, role: "user" });
      }

      const educationBadge = await storage.getBadgeByTypeAndRequirement("education", 1);
      if (educationBadge) {
        await storage.awardBadge(userId, educationBadge.id);
        res.json({ message: "Education badge awarded successfully" });
      } else {
        // If the badge doesn't exist, create it and then award it
        const newBadge = await storage.createBadge({ 
          name: "교육 이수", 
          description: "나무 세기 교육을 이수했습니다.", 
          type: "education", 
          requirement: 1 
        });
        await storage.awardBadge(userId, newBadge.id);
        res.json({ message: "Education badge created and awarded successfully" });
      }
    } catch (error) {
      console.error("Error awarding education badge:", error);
      res.status(500).json({ error: "Failed to award education badge" });
    }
  });

  // Admin route to create a user (for testing purposes)
  app.post("/api/admin/users", async (req, res) => {
    try {
      const userData = z.object({
        id: z.string(),
        email: z.string().email(),
        role: z.string(),
      }).parse(req.body);
      const user = await storage.upsertUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:userId/role", async (req, res) => {
    try {
      const userId = req.params.userId;
      const { role } = req.body;
      
      if (!["user", "supervisor", "admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      
      await storage.updateUserRole(userId, role);
      res.json({ message: "User role updated successfully" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });


    app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        const newUser = await storage.upsertUser({
          id: email, // 이메일을 ID로 사용 (간단한 테스트 목적)
          email: email,
          passwordHash: await bcrypt.hash(password, 10), // 입력된 비밀번호를 해싱하여 저장
          role: "user", // 기본 역할은 'user'
        });
        const token = jwt.sign({ sub: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });
        res.setHeader("Set-Cookie", cookie.serialize("token", token, {
          httpOnly: true,
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        } ));
        return res.status(200).json({ message: "새 계정 생성 및 로그인 성공" });
      }

  //    if (!user.passwordHash) {
//        return res.status(401).json({ message: "비밀번호가 설정되지 않았습니다." });
//      }

//      const passwordValid = await bcrypt.compare(password, user.passwordHash);
//      if (!passwordValid) {
//        return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
//      }

      const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.setHeader("Set-Cookie", cookie.serialize("token", token, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7일
        sameSite: "lax", // CSRF 보호를 위해 추가
        secure: process.env.NODE_ENV === "production", // HTTPS에서만 쿠키 전송
      }));
      res.status(200).json({ message: "로그인 성공" });
    } catch (err) {
      console.error("로그인 실패:", err);
      res.status(500).json({ message: "로그인 중 오류 발생" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    const { id, email, password, role } = req.body;
  
    if (!id || !email || !password) {
      return res.status(400).json({ error: "id, email, password는 필수입니다" });
    }
  
    try {
      const passwordHash = await bcrypt.hash(password, 10);
  
      const newUser = await storage.upsertUser({
        id,
        email,
        passwordHash,
        role: role || "user",
      });
  
      res.status(201).json({ message: "유저가 생성되었습니다", user: newUser });
    } catch (error) {
      console.error("유저 생성 실패:", error);
      res.status(500).json({ error: "유저 생성 중 오류 발생" });
    }
  });

  app.get("/api/logout", (req, res) => {
    res.setHeader("Set-Cookie", cookie.serialize("token", "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    }));
    res.redirect("/");
  });

  
  const httpServer = createServer(app);
  return httpServer;
}


