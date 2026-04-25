import type { AppContext } from "../context";
import { GraphQLError } from "graphql/error";
import { pubSub } from "../pubsub";

type CvInput = {
  name: string;
  Age?: number | null;
  Job?: string | null;
  UserId: string;
  skillsId?: string[] | null;
};

type CvUpdateInput = {
  name?: string;
  Age?: number | null;
  Job?: string | null;
  UserId?: string;
  skillsId?: string[] | null;
};

type PrismaCvPayload = {
  id: string;
  name: string;
  age: number | null;
  job: string | null;
  userId: string;
  skills?: Array<{ id: string; designation: string }>;
};

function mapCvToGraphQL(cv: PrismaCvPayload) {
  return {
    id: cv.id,
    name: cv.name,
    Age: cv.age,
    Job: cv.job,
    UserId: cv.userId,
    skillsId: cv.skills?.map((skill) => skill.id) ?? [],
    skills: cv.skills,
  };
}

export const Mutation = {
  createCv: async (
    _parent: unknown,
    { input }: { input: CvInput },
    { prisma }: AppContext,
  ) => {
    const user = await prisma.user.findUnique({ where: { id: input.UserId } });
    if (!user) {
      throw new GraphQLError(`User with id ${input.UserId} does not exist`);
    }

    const skillIds = [...new Set(input.skillsId ?? [])];
    if (skillIds.length > 0) {
      const foundSkills = await prisma.skill.findMany({
        where: { id: { in: skillIds } },
      });
      if (foundSkills.length !== skillIds.length) {
        throw new GraphQLError(
          `One or more skills with ids ${skillIds.join(", ")} do not exist`,
        );
      }
    }

    const newCv = await prisma.cv.create({
      data: {
        name: input.name,
        age: input.Age ?? null,
        job: input.Job ?? null,
        user: {
          connect: { id: input.UserId },
        },
        ...(skillIds.length > 0
          ? {
              skills: {
                connect: skillIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: { skills: true },
    });

    const payloadCv = mapCvToGraphQL(newCv);

    await pubSub.publish("cvChanged", {
      mutation: "CREATED",
      cvId: payloadCv.id,
      cv: payloadCv,
    });

    return payloadCv;
  },
  updateCv: async (
    _parent: unknown,
    { id, input }: { id: string; input: CvUpdateInput },
    { prisma }: AppContext,
  ) => {
    const existingCv = await prisma.cv.findUnique({ where: { id } });
    if (!existingCv) {
      throw new GraphQLError(`Cv with id ${id} does not exist`);
    }

    if (input.UserId) {
      const user = await prisma.user.findUnique({ where: { id: input.UserId } });
      if (!user) {
        throw new GraphQLError(`User with id ${input.UserId} does not exist`);
      }
    }

    const skillIds = input.skillsId ? [...new Set(input.skillsId)] : undefined;
    if (skillIds && skillIds.length > 0) {
      const foundSkills = await prisma.skill.findMany({
        where: { id: { in: skillIds } },
      });
      if (foundSkills.length !== skillIds.length) {
        throw new GraphQLError(
          `One or more skills with ids ${skillIds.join(", ")} do not exist`,
        );
      }
    }

    const updatedCv = await prisma.cv.update({
      where: { id },
      data: {
        ...(typeof input.name === "string" ? { name: input.name } : {}),
        ...(typeof input.Age !== "undefined" ? { age: input.Age } : {}),
        ...(typeof input.Job !== "undefined" ? { job: input.Job } : {}),
        ...(input.UserId
          ? {
              user: {
                connect: { id: input.UserId },
              },
            }
          : {}),
        ...(typeof skillIds !== "undefined"
          ? {
              skills: {
                set: skillIds.map((skillId) => ({ id: skillId })),
              },
            }
          : {}),
      },
      include: { skills: true },
    });

    const payloadCv = mapCvToGraphQL(updatedCv);

    await pubSub.publish("cvChanged", {
      mutation: "UPDATED",
      cvId: payloadCv.id,
      cv: payloadCv,
    });

    return payloadCv;
  },
  deleteCv: async (
    _parent: unknown,
    { id }: { id: string },
    { prisma }: AppContext,
  ) => {
    const existingCv = await prisma.cv.findUnique({
      where: { id },
      include: { skills: true },
    });
    if (!existingCv) {
      throw new GraphQLError(`Cv with id ${id} does not exist`);
    }

    await prisma.cv.delete({ where: { id } });

    const payloadCv = mapCvToGraphQL(existingCv);

    await pubSub.publish("cvChanged", {
      mutation: "DELETED",
      cvId: payloadCv.id,
      cv: payloadCv,
    });

    return true;
  },
};
