import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.cv.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      { id: "1", name: "Med", email: "med@gmail.com", role: "ADMIN" },
      { id: "2", name: "Sami", email: "sami@gmail.com", role: "USER" },
      { id: "3", name: "Yazid", email: "yazid@gmail.com", role: "USER" },
      { id: "4", name: "Ali", email: "ali@gmail.com", role: "USER" },
    ],
  });

  await prisma.skill.createMany({
    data: [
      { id: "1", designation: "JS" },
      { id: "2", designation: "TS" },
      { id: "3", designation: "Python" },
      { id: "4", designation: "Java" },
    ],
  });

  await prisma.cv.create({
    data: {
      id: "1",
      name: "CV Med",
      age: 22,
      job: "Fullstack Developer",
      user: { connect: { id: "1" } },
      skills: { connect: [{ id: "4" }, { id: "1" }] },
    },
  });

  await prisma.cv.create({
    data: {
      id: "2",
      name: "CV Sami",
      age: 25,
      job: "Backend Developer",
      user: { connect: { id: "2" } },
      skills: { connect: [{ id: "1" }, { id: "2" }] },
    },
  });

  await prisma.cv.create({
    data: {
      id: "3",
      name: "CV Yazid",
      age: 30,
      job: "Data Scientist",
      user: { connect: { id: "3" } },
      skills: { connect: [{ id: "2" }, { id: "3" }] },
    },
  });

  await prisma.cv.create({
    data: {
      id: "4",
      name: "CV Ali",
      age: 28,
      job: "Frontend Developer",
      user: { connect: { id: "4" } },
      skills: { connect: [{ id: "4" }, { id: "3" }] },
    },
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
