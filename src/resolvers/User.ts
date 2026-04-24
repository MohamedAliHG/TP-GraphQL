import type { AppContext } from "../context";
import { Cv } from "./Cv";

export const User = {
   Cvs: (parent: { id: string }, _args: unknown, { _db }: AppContext) =>
        _db.cvs.filter((cv) => String(cv.UserId) === parent.id)
}