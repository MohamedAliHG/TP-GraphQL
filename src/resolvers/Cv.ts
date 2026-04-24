import type { AppContext } from "../context";

export const Cv={
    User: (parent: any, _args: unknown, { _db }: AppContext) => _db.users.find(user => user.id === parent.UserId),
    skills: (parent: any, _args: unknown, { _db }: AppContext) => parent.skillsId.map((skillId: number) => _db.skills.find(skill => skill.id === skillId.toString()))
}