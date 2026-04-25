import { prisma } from "./prisma";

export type AppContext = {
  prisma: typeof prisma;
};

export function createContext(): AppContext {
  return { prisma };
}