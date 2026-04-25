import type { AppContext } from "../context";

export const Query = {
  Users: (_parent: unknown, _args: unknown, { prisma }: AppContext) =>
    prisma.user.findMany(),
  User: (_parent: unknown, { id }: { id: string }, { prisma }: AppContext) =>
    prisma.user.findUnique({ where: { id } }),
  Skills: (_parent: unknown, _args: unknown, { prisma }: AppContext) =>
    prisma.skill.findMany(),
  Skill: (_parent: unknown, { id }: { id: string }, { prisma }: AppContext) =>
    prisma.skill.findUnique({ where: { id } }),
  Cvs: (_parent: unknown, _args: unknown, { prisma }: AppContext) =>
    prisma.cv.findMany({ include: { skills: true, user: true } }),
  Cv: (_parent: unknown, { id }: { id: string }, { prisma }: AppContext) =>
    prisma.cv.findUnique({ where: { id }, include: { skills: true, user: true } }),
};
