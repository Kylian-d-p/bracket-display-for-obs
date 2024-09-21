"use server";

import prisma from "@/src/database";
import { matchesSchema } from "@/zodTypes";
import { z } from "zod";

export default async function saveBracketAndMatches(bracket: {name: string, description?: string}, matches: z.infer<typeof matchesSchema>) {
  const checkedBracketName = await z.object({name: z.string().min(1), description: z.string().optional()}).safeParseAsync(bracket);
  const checkedMatches = await matchesSchema.safeParseAsync(matches);

  if (!checkedBracketName.success) {
    return { error: "You must provide a name for your bracket" }
  }

  if (!checkedMatches.success) {
    return { error: "Invalid matches" }
  }

  const createdBracket = await prisma.brackets.create({
    data: {
      name: checkedBracketName.data.name,
      description: checkedBracketName.data.description,
    }
  })

  for (const match of checkedMatches.data) {
    await prisma.matches.create({
      data: {
        team1: match.team1,
        team2: match.team2,
        score1: match.score1,
        score2: match.score2,
        date: match.date,
        phase: match.phase,
        bracket_id: createdBracket.id
      }
    })
  }

  return { bracketId: createdBracket.id }
}