import type { AppContext } from "../context";

export const Cv = {
  Age: (parent: any) => parent.Age ?? parent.age ?? null,
  Job: (parent: any) => parent.Job ?? parent.job ?? null,
  User: async (parent: any, _args: unknown, { prisma }: AppContext) => {
    if (parent.User) {
      return parent.User;
    }
    if (parent.user) {
      return parent.user;
    }
    const userId = parent.UserId ?? parent.userId;
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
