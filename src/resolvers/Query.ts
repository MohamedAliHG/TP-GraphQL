import type { AppContext } from "../context";

export const Query = {
  Users: (_parent: unknown, _args: unknown, { _db }: AppContext) => _db.users,
  User: (_parent: unknown, { id }: { id: string }, { _db }: AppContext) => _db.users.find((user) => user.id === id),
  Skills: (_parent: unknown, _args: unknown, { _db }: AppContext) => _db.skills,
  Skill: (_parent: unknown, { id }: { id: string }, { _db }: AppContext) => _db.skills.find((skill) => skill.id === id),
  Cvs: (_parent: unknown, _args: unknown, { _db }: AppContext) => _db.cvs,
  Cv: (_parent: unknown, { id }: { id: string }, { _db }: AppContext) => _db.cvs.find((cv) => cv.id === id), 
};
