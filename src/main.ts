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
import { Blockchain } from "./blockchain";
import { genesisBlock } from "./genesis-block";
import { MemoryBank } from "./memory-bank";

dotenv.config({
  path: ".env",
});

// const prisma = new PrismaClient();

// const redis = new ioredis({
//   maxRetriesPerRequest: null,
//   host: process.env.REDIS_HOST || "localhost",
//   port: Number(process.env.REDIS_PORT) || 6379,
// });

const bank = new MemoryBank(
  [
    genesisBlock,
    //
  ],
  [
    {
      address: "a",
      balance: 100,
    },
  ]
);

const blockchain = new Blockchain(bank);

[
  createTransaction("a", "b", 10),
  createTransaction("a", "b", 50),
  //
].map((transaction) => blockchain.addTransaction(transaction));

blockchain.commit().then(async () => {

  const aBalance = await bank.queryAccountByAddress("a")

  console.log(
    "balance a @", aBalance,
  )

  const bBalance = await bank.queryAccountByAddress("b")

  console.log(
    "balance b @", bBalance
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
