import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().min(1, "Email is required").max(255),
  password: z.string().min(6, "Password is required").max(255),
  name: z.string().min(3, "Name is required").max(255),
});
