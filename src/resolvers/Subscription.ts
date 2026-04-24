import { pubSub } from "../pubsub";

export const Subscription = {
  cvChanged: {
    subscribe: () => pubSub.subscribe("cvChanged"),
  },
} as any;
