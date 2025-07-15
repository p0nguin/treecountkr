import {
  users,
  trees,
  badges,
  userBadges,
  treeSpecies,
  type User,
  type UpsertUser,
  type InsertTree,
  type Tree,
  type Badge,
  type UserBadge,
  type TreeSpecies,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and, or, like, desc, count } from "drizzle-orm";

export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? null;
}


// Interface for storage operations
export interface IStorage {
  getUserByEmail(email: string): Promise<User | null>;

  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(userId: string, role: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  // Tree operations
  getAllTrees(): Promise<Tree[]>;
  getTree(id: number): Promise<Tree | undefined>;

  
  createTree(tree: InsertTree): Promise<Tree>;
  updateTreeStatus(id: number, status: string, reviewerId?: string, notes?: string): Promise<void>;
  getTreesByUser(userId: string): Promise<Tree[]>;
  getTreesByStatus(status: string): Promise<Tree[]>;
  searchTrees(query: string): Promise<Tree[]>;
  getTreeStats(): Promise<any>;
  
  // Badge operations
  getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userId: string, badgeId: number): Promise<void>;
  getAllBadges(): Promise<Badge[]>;
  createBadge(badge: any): Promise<Badge>;
  getBadgeByTypeAndRequirement(type: string, requirement: number): Promise<Badge | undefined>;
  
  // Tree species operations
  getAllTreeSpecies(): Promise<TreeSpecies[]>;
  getTreeSpecies(name: string): Promise<TreeSpecies | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] ?? null;
  }
  
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {

    
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Tree operations
  async getAllTrees(): Promise<Tree[]> {
    return await db.select().from(trees).orderBy(desc(trees.createdAt));
  }

  async getTree(id: number): Promise<Tree | undefined> {
    const [tree] = await db.select().from(trees).where(eq(trees.id, id));
    return tree;
  }

  async createTree(treeData: InsertTree): Promise<Tree> {
    const [tree] = await db
      .insert(trees)
      .values(treeData)
      .returning();
    
    // Check for badge eligibility
    await this.checkTreeCountBadges(treeData.contributorId);
    
    return tree;
  }

  async updateTreeStatus(id: number, status: string, reviewerId?: string, notes?: string): Promise<void> {
    await db
      .update(trees)
      .set({
        status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: notes,
      })
      .where(eq(trees.id, id));
  }

  async getTreesByUser(userId: string): Promise<Tree[]> {
    return await db
      .select()
      .from(trees)
      .where(eq(trees.contributorId, userId))
      .orderBy(desc(trees.createdAt));
  }

  async getTreesByStatus(status: string): Promise<Tree[]> {
    return await db
      .select()
      .from(trees)
      .where(eq(trees.status, status))
      .orderBy(desc(trees.createdAt));
  }

  async searchTrees(query: string): Promise<Tree[]> {
    return await db
      .select()
      .from(trees)
      .where(
        or(
          like(trees.species, `%${query}%`),
          like(trees.notes, `%${query}%`)
        )
      )
      .orderBy(desc(trees.createdAt));
  }

  async getTreeStats(): Promise<any> {
    const totalTrees = await db.select({ count: count() }).from(trees);
    const approvedTrees = await db.select({ count: count() }).from(trees).where(eq(trees.status, 'approved'));
    
    const conditionStats = await db
      .select({
        condition: trees.condition,
        count: count(),
      })
      .from(trees)
      .where(eq(trees.status, 'approved'))
      .groupBy(trees.condition);

    const speciesStats = await db
      .select({
        species: trees.species,
        count: count(),
      })
      .from(trees)
      .where(eq(trees.status, 'approved'))
      .groupBy(trees.species);

    const contributors = await db
      .select({
        contributorId: trees.contributorId,
      })
      .from(trees)
      .where(eq(trees.status, 'approved'))
      .groupBy(trees.contributorId);

    const recentTrees = await db
      .select()
      .from(trees)
      .where(eq(trees.status, 'approved'))
      .orderBy(desc(trees.createdAt))
      .limit(5);

    const healthyCount = conditionStats.find(s => s.condition === 'excellent')?.count || 0;
    const totalApproved = approvedTrees[0]?.count || 0;

    return {
      totalTrees: totalTrees[0]?.count || 0,
      species: speciesStats.length,
      contributors: contributors.length,
      healthyPercentage: totalApproved > 0 ? Math.round((Number(healthyCount) / totalApproved) * 100) : 0,
      speciesDistribution: Object.fromEntries(
        speciesStats.map(s => [s.species, Number(s.count)])
      ),
      conditionDistribution: Object.fromEntries(
        conditionStats.map(s => [s.condition, Number(s.count)])
      ),
      recentTrees: recentTrees.map(tree => ({
        ...tree,
        contributor: tree.contributorId,
      })),
    };
  }

  // Badge operations
  async getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
    return await db
      .select({
        id: userBadges.id,
        userId: userBadges.userId,
        badgeId: userBadges.badgeId,
        awardedAt: userBadges.awardedAt,
        badge: {
          id: badges.id,
          name: badges.name,
          description: badges.description,
          type: badges.type,
          requirement: badges.requirement,
          icon: badges.icon,
          createdAt: badges.createdAt,
        },
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));
  }

  async awardBadge(userId: string, badgeId: number): Promise<void> {
    await db
      .insert(userBadges)
      .values({ userId, badgeId })
      .onConflictDoNothing();
  }

  async getAllBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }

  async createBadge(badgeData: any): Promise<Badge> {
    const [badge] = await db
      .insert(badges)
      .values(badgeData)
      .returning();
    return badge;
  }

  async getBadgeByTypeAndRequirement(type: string, requirement: number): Promise<Badge | undefined> {
    const [badge] = await db
      .select()
      .from(badges)
      .where(and(
        eq(badges.type, type),
        eq(badges.requirement, requirement)
      ));
    return badge;
  }

  // Tree species operations
  async getAllTreeSpecies(): Promise<TreeSpecies[]> {
    return await db.select().from(treeSpecies);
  }

  async getTreeSpecies(name: string): Promise<TreeSpecies | undefined> {
    const [species] = await db.select().from(treeSpecies).where(eq(treeSpecies.name, name));
    return species;
  }

  // Helper method to check and award tree count badges
  private async checkTreeCountBadges(userId: string): Promise<void> {
    const userTreeCount = await db
      .select({ count: count() })
      .from(trees)
      .where(and(
        eq(trees.contributorId, userId),
        eq(trees.status, 'approved')
      ));

    const treeCount = Number(userTreeCount[0]?.count || 0);
    
    // Check for 50, 100, 200, 500 tree badges
    const milestones = [50, 100, 200, 500];
    for (const milestone of milestones) {
      if (treeCount >= milestone) {
        const [badge] = await db
          .select()
          .from(badges)
          .where(and(
            eq(badges.type, 'tree_count'),
            eq(badges.requirement, milestone)
          ));
        
        if (badge) {
          await this.awardBadge(userId, badge.id);
        }
      }
    }
  }
}

export const storage = new DatabaseStorage();
