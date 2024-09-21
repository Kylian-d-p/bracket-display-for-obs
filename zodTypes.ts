import { z } from "zod";

export const matchesSchema = z.array(z.object({
  team1: z.string().nullable(),
  team2: z.string().nullable(),
  score1: z.number().nullable(),
  score2: z.number().nullable(),
  date: z.date().nullable(),
  phase: z.number(),
}))