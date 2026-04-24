import { create } from "node:domain";
import type { AppContext } from "../context";
import { GraphQLError } from "graphql/error";

export const Mutation = {
    createCv: (_parent: unknown, { input }: { input: any }, { _db }: AppContext) => {
        if (input.UserId && !_db.users.find((user) => user.id === input.UserId)) {
            throw new GraphQLError(`User with id ${input.UserId} does not exist`);
        }
        if (input.skillsId && !input.skillsId.every((skillId: string) => _db.skills.find((skill) => skill.id === skillId))) {
            throw new GraphQLError(`One or more skills with ids ${input.skillsId.join(", ")} do not exist`);
        }
        const newCv = {
            id: String(_db.cvs.length + 1),
            ...input
        };
        _db.cvs.push(newCv);
        return newCv;
    },
    updateCv: (_parent: unknown, { id, input }: { id: string; input: any }, { _db }: AppContext) => {
        const cvIndex = _db.cvs.findIndex((cv) => cv.id === id);
        if (cvIndex === -1) {
            throw new GraphQLError(`Cv with id ${id} does not exist`);
        }
        if (input.UserId && !_db.users.find((user) => user.id === input.UserId)) {
            throw new GraphQLError(`User with id ${input.UserId} does not exist`);
        }
        if (input.skillsId && !input.skillsId.every((skillId: string) => _db.skills.find((skill) => skill.id === skillId))) {
            throw new GraphQLError(`One or more skills with ids ${input.skillsId.join(", ")} do not exist`);
        }
        const updatedCv = { ..._db.cvs[cvIndex], ...input };
        _db.cvs[cvIndex] = updatedCv;
        return updatedCv;
    },
    deleteCv: (_parent: unknown, { id }: { id: string }, { _db }: AppContext) => {
        const cvIndex = _db.cvs.findIndex((cv) => cv.id === id);
        if (cvIndex === -1) {
            throw new GraphQLError(`Cv with id ${id} does not exist`);
        }
        _db.cvs.splice(cvIndex, 1);
        return true;
    }
}