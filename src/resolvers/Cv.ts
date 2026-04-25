import type { AppContext } from "../context";

export const Cv = {
  Age: (parent: any) => parent.age ?? null,
  Job: (parent: any) => parent.job ?? null,
  user: async (parent: any, _args: unknown, { prisma }: AppContext) => {
    if (parent.user) {
      return parent.user;
    }
    const userId = parent.userId;
    if (!userId) {
      return null;
    }
    return prisma.user.findUnique({ where: { id: userId } });
  },
  skills: async (parent: any, _args: unknown, { prisma }: AppContext) => {
    if (parent.skills) {
      return parent.skills;
    }

    const cv = await prisma.cv.findUnique({
      where: { id: parent.id },
      include: { skills: true },
    });
    return cv?.skills ?? [];
  },
};
