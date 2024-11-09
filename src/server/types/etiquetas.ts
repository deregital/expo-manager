import { type Prisma } from 'expo-backend-types';

export type TagWithGroupColor = Prisma.TagGetPayload<{
  select: {
    id: true;
    name: true;
    type: true;
    group: { select: { color: true; id: true; isExclusive: true } };
  };
}>;
