import { pubSub, type CvEventPayload } from "../pubsub";

export const Subscription = {
  cvChanged: {
    subscribe: () => pubSub.subscribe("cvChanged"),
    resolve: (payload: CvEventPayload) => payload,
  },
} as any;
