import ThemeToggle from "@/components/theme/theme-toggle";
import { redirect } from "next/navigation";
import BracketEditor from "./bracket-editor";
import prisma from "@/src/database";

export default async function EditBracket(props: { params: { bracketId: string } }) {
  if (typeof props.params.bracketId !== "string") {
    redirect("/")
  }

  const bracket = await prisma.brackets.findUnique({
    where: {
      id: props.params.bracketId
    },
    select: {
      id: true,
      name: true,
      description: true
    }
  })

  if (!bracket) {
    redirect("/")
  }

  const matches = await prisma.matches.findMany({
    where: {
      bracket_id: props.params.bracketId
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

  if (!matches) {
    redirect("/")
  }

  return (
    <>
      <div className="p-2 flex items-center justify-between gap-2 shadow-sm">
        <h1 className="text-3xl">EDIT YOUR BRACKET OVERLAY FOR OBS</h1>
        <ThemeToggle />
      </div>
      <main className="w-[calc(100%-20px) mx-auto py-2">
        <BracketEditor bracket={bracket} matches={matches} />
      </main>
    </>
  )
}