import cron from "node-cron";
import zod from "zod";
import { PrismaClient } from "./prisma";
import { Job, Queue, Worker } from "bullmq";
import ioredis from "ioredis";
import pLimit, { LimitFunction } from "p-limit";
import axios from "axios";
import _ from "underscore";
import dotenv from "dotenv";
import { createTransaction, Transaction } from "./transaction";
import { DefaultStateManager } from "./default-state-manager";
import { Controller } from "./controller";

dotenv.config({
  path: ".env",
});

// const prisma = new PrismaClient();

// const redis = new ioredis({
//   maxRetriesPerRequest: null,
//   host: process.env.REDIS_HOST || "localhost",
//   port: Number(process.env.REDIS_PORT) || 6379,
// });

const stateManager = new DefaultStateManager(
  __dirname + "/../data.json"
);

const ctl = new Controller(stateManager);

const tx1 = createTransaction("a", "b", 11)
const tx2 = createTransaction("a", "b", 20)

ctl.addTransaction(tx1)
ctl.addTransaction(tx2)

ctl.commit().then(async () => {

  const balance1 = await stateManager.queryAccountByAddress("a")

  console.log(
    "balance a @", balance1,
  )

  const balance2 = await stateManager.queryAccountByAddress("b")

  console.log(
    "balance b @", balance2
  )

  console.log(
    "tx1 @", tx1
  )

  console.log(
    "tx2 @", tx2
  )

  console.log(
    await stateManager.queryAccounts()
  )

});

// const build = async () => {

// };

// const start = async () => {
//   console.log("starting server..");

//   try {
//     await prisma.$connect();

//     // every 5 minutes
//     cron.schedule("*/5 * * * *", async () => {
//     });
//   } catch (err) {}
// };

// const shutdown = async () => {
//   await prisma.$disconnect();
//   await redis.quit();
// };

// build().then(start);

// ["SIGINT", "SIGTERM"].map((sig) => process.on(sig, shutdown));
