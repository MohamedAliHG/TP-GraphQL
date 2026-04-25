import type { AppContext } from "../context";

export const Skill = {
    Designation: (parent: { Designation?: string; designation?: string }) =>
        parent.Designation ?? parent.designation,
    Cvs: (parent: { id: string }, _args: unknown, { prisma }: AppContext) =>
        prisma.cv.findMany({ where: { skills: { some: { id: parent.id } } } }),
};