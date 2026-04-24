import _db from "./_db";

export type AppContext = {
  _db: typeof _db;
};

export function createContext(): AppContext {
  return { _db };
}