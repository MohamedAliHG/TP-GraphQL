import { createPubSub } from "graphql-yoga";

export type CvEventType = "CREATED" | "UPDATED" | "DELETED";

export type CvEventPayload = {
  mutation: CvEventType;
  cv: {
    id: string;
    name: string;
    Age?: number | null;
    Job?: string | null;
    UserId: string;
    skillsId?: string[];
    skills?: Array<{ id: string; designation: string }>;
  };
  cvId: string;
};

export const pubSub = createPubSub<{
  cvChanged: [CvEventPayload];
}>();
