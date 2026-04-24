import type { AppContext } from "../context";
import { Cv } from "./Cv";

export const Skill = {
    Cvs: (parent: { id: string }, _args: unknown, { _db }: AppContext) =>
        _db.cvs.filter((cv) => cv.skillsId.includes(parent.id)),
   
}