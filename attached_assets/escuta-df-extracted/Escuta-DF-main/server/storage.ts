import { db } from "./db";
import { reports, type InsertReport, type Report } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createReport(report: InsertReport): Promise<Report>;
  getReportByProtocol(protocol: string): Promise<Report | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createReport(insertReport: InsertReport): Promise<Report> {
    // Generate a protocol number: YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const protocol = `${dateStr}-${randomSuffix}`;

    const [report] = await db
      .insert(reports)
      .values({ ...insertReport, protocol })
      .returning();
    return report;
  }

  async getReportByProtocol(protocol: string): Promise<Report | undefined> {
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.protocol, protocol));
    return report;
  }
}

export const storage = new DatabaseStorage();
