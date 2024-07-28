import "dotenv/config";
import express, { ErrorRequestHandler } from "express";
import { dbClient } from "@db/client";
import helmet from "helmet";
import cors from "cors";
import { todoTable } from "@db/schema";
import { eq } from "drizzle-orm";

//Intializing the express app สำหรับจัดการ http request
const app = express();

// Extracts the entire body(json) portion of an incoming(http) request stream and exposes it on req.body.
// Middleware ที่ใช้เพื่อแปลง request body ที่เป็น JSON ให้อยู่ในรูปแบบของ JavaScript objects และเผยแพร่ใน req.body
app.use(express.json());

app.use(helmet());
// for protect XSS,HSTS attack

app.use(
    cors({origin:false})
);
// ป้องกันการเรียกใช้งานข้ามโดเมน (ในกรณีนี้ CORS ถูกปิดใช้งาน)

// Query
app.get("/todo", async (req, res, next) => {
  try {
    const results = await dbClient.query.todoTable.findMany();
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// Insert
app.put("/todo", async (req, res, next) => {
    try {
      const todoText = req.body.todoText ?? "";
      if (!todoText) throw new Error("Empty todoText");
      const result = await dbClient
        .insert(todoTable)
        .values({
          todoText,
        })
        .returning({ id: todoTable.id, todoText: todoTable.todoText });
      res.json({ msg: `Insert successfully`, data: result[0] });
    } catch (err) {
      next(err);
    }
  });
  
  // Update
  app.patch("/todo", async (req, res, next) => {
    try {
      const id = req.body.id ?? "";
      const todoText = req.body.todoText ?? "";
      if (!todoText || !id) throw new Error("Empty todoText or id");
  
      // Check for existence if data
      const results = await dbClient.query.todoTable.findMany({
        where: eq(todoTable.id, id),
      });
      if (results.length === 0) throw new Error("Invalid id");
  
      const result = await dbClient
        .update(todoTable)
        .set({ todoText })
        .where(eq(todoTable.id, id))
        .returning({ id: todoTable.id, todoText: todoTable.todoText });
      res.json({ msg: `Update successfully`, data: result });
    } catch (err) {
      next(err);
    }
  });
  
  // Delete
  app.delete("/todo", async (req, res, next) => {
    try {
      const id = req.body.id ?? "";
      if (!id) throw new Error("Empty id");
  
      // Check for existence if data
      const results = await dbClient.query.todoTable.findMany({
        where: eq(todoTable.id, id),
      });
      if (results.length === 0) throw new Error("Invalid id");
  
      await dbClient.delete(todoTable).where(eq(todoTable.id, id));
      res.json({
        msg: `Delete successfully`,
        data: { id },
      });
    } catch (err) {
      next(err);
    }
  });
  
  app.post("/todo/all", async (req, res, next) => {
    try {
      await dbClient.delete(todoTable);
      res.json({
        msg: `Delete all rows successfully`,
        data: {},
      });
    } catch (err) {
      next(err);
    }
  });

  const jsonErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let serializedError = JSON.stringify(err, Object.getOwnPropertyNames(err));
    serializedError = serializedError.replace(/\/+/g, "/");
    serializedError = serializedError.replace(/\\+/g, "/");
    res.status(500).send({ error: serializedError });
  };
  app.use(jsonErrorHandler);
  

// app.get("/",(req,res) => {
//     res.json({"msg" : "hello world"})
// })

// Running app
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Listening on port ${PORT}`);
});

// 'tsc' คำสั่งนี้จะแปลงไฟล์ .ts เป็น .js ตามการตั้งค่าที่กำหนดใน tsconfig.json
// 'tsc-alias' ใช้สำหรับจัดการ alias (เช่น path mapping) ที่กำหนดใน tsconfig.json หลังจากการคอมไพล์ด้วย tsc