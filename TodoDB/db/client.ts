import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@db/schema";
import postgres from "postgres";
import { connectionString } from "@db/utils";

export const dbConn = postgres(connectionString);

export const dbClient = drizzle(dbConn, { schema: schema, logger: true });

// เรียกใช้ drizzle เพื่อสร้าง client สำหรับการเชื่อมต่อกับ PostgreSQL โดยใช้ dbConn ที่เป็นการเชื่อมต่อฐานข้อมูล
// schema ที่ถูกนำเข้ามาจากไฟล์ @db/schema เพื่อกำหนด schema หรือโมเดลของฐานข้อมูล
// logger: true ใช้เปิดการเขียน log สำหรับคำสั่ง SQL ที่ถูกส่งไปยังฐานข้อมูล PostgreSQL

// CRUD : 

// this file create for communicate with database