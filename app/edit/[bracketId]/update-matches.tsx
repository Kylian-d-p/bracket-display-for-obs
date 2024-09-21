"use server";

import prisma from "@/src/database";
import { matchesSchema } from "@/zodTypes";
import { z } from "zod";

export default async function updateMatches(matches: z.infer<typeof matchesSchema>, bracketId: string) {
  const checkedMatches = await matchesSchema.safeParseAsync(matches)
  const checkedBracketId = await z.string().safeParseAsync(bracketId)

  if (!checkedMatches.success) {
    return {error: "Invalid matches"}
  }

  if (!checkedBracketId.success) {
    return {error: "Invalid bracketId"}
  }

  await prisma.matches.deleteMany({
    where: {
      bracket_id: checkedBracketId.data
    }
  })

  await prisma.matches.createMany({
    data: checkedMatches.data.map(match => ({
      bracket_id: checkedBracketId.data,
      team1: match.team1,
      team2: match.team2,
      score1: match.score1,
      score2: match.score2,
      phase: match.phase
    }))
  })

  return {data: checkedMatches.data}
}