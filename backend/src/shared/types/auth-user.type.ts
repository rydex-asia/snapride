import { Role } from '@prisma/client';

export type AuthUser = {
  sub: string;
  authUserId: string;
  role: Role;
  phone?: string | null;
  email?: string | null;
};
