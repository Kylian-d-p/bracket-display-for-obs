"use server";

import prisma from "@/src/database";
import { z } from "zod";

export default async function getBracket(bracketId: string) {
  const checkedBracketId = await z.string().safeParseAsync(bracketId)

  if (!checkedBracketId.success) {
    return { error: "Invalid bracketId" }
  }

  const bracket = await prisma.brackets.findUnique({
    where: {
      id: checkedBracketId.data
    },
    select: {
      id: true,
      name: true,
      description: true
    }
  })

  const matches = await prisma.matches.findMany({
    where: {
      bracket_id: checkedBracketId.data
    },
    orderBy: {
      phase: "asc"
    },
    select: {
      team1: true,
      team2: true,
      score1: true,
      score2: true,
      date: true,
      phase: true
    }
  })

  if (!bracket || !matches) {
    return { error: "Bracket not found" }
  }

  return { data: { bracket, matches } }
}