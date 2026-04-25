import type { AppContext } from "../context";

export const User = {
        Cvs: (parent: { id: string }, _args: unknown, { prisma }: AppContext) =>
                prisma.cv.findMany({ where: { userId: parent.id } }),
};