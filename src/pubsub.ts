import { createPubSub } from "graphql-yoga";

export type CvEventType = "CREATED" | "UPDATED" | "DELETED";

export type CvEventPayload = {
  mutation: CvEventType;
  cv: {
    id: string;
    name: string;
    Age?: number;
    Job?: string;
    UserId: string;
    skillsId?: string[];
  };
  cvId: string;
};

export const pubSub = createPubSub<{
  cvChanged: [CvEventPayload];
}>();
