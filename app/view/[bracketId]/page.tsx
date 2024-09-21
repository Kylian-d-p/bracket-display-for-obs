"use client";

import { matchesSchema } from "@/zodTypes";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import getBracket from "./getBracket";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";

export default function ViewBracket(props: { params: { bracketId: string } }) {
  const [error, setError] = useState<string | null>(null);
  // const [bracket, setBracket] = useState<{ name: string, description?: string | null, id: string } | null>(null);
  const [matches, setMatches] = useState<z.infer<typeof matchesSchema>>([]);

  const numberOfPhase = useMemo(() => Math.max(...matches.map(match => match.phase)), [matches]);

  const searchParams = useSearchParams();
  const theme = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      const fetchBracket = async () => {
        const bracket = await getBracket(props.params.bracketId);
        if (bracket.error) {
          setError(bracket.error);
          return;
        }
        if (bracket.data) {
          // setBracket(bracket.data.bracket);
          setMatches(bracket.data.matches);
        }
      }
      fetchBracket();
    }, 2000)

    return () => clearInterval(interval)
  }, [props.params.bracketId])

  useEffect(() => {
    if (searchParams.get("theme") === "dark") {
      theme.setTheme("dark")
    } else if (searchParams.get("theme") === "light") {
      theme.setTheme("light")
    }
  }, [searchParams, theme])

  if (error) {
    return <div>{error}</div>
  }

  if (typeof props.params.bracketId !== "string") {
    return <div>Invalid bracket id</div>
  }

  return (
    <div className="grid pt-2 pb-4" style={{ gridTemplateColumns: `repeat(${numberOfPhase}, minmax(0, 1fr))`, width: `${numberOfPhase * 200}px` }}>
      {
        Array.from({ length: numberOfPhase }).map((_, index1) => (
          <div key={index1} className="flex flex-col gap-2 justify-around">
            {
              matches.filter(m => m.phase === index1 + 1).map((match, index2) => (
                <div key={index2} className="p-2 flex flex-col justify-evenly rounded border border-border h-16 w-40 relative bg-background">
                  <div className="flex justify-between items-center"><p className={`${!match.team1 && "text-muted-foreground"}`}>{match.team1 ?? "TBD"}</p>{match.score1 && <span>{match.score1}</span>}</div>
                  <div className="flex justify-between items-center"><p className={`${!match.team2 && "text-muted-foreground"}`}>{match.team2 ?? "TBD"}</p>{match.score2 && <span>{match.score2}</span>}</div>
                  {index1 !== numberOfPhase - 1 && <div className={`absolute right-0 translate-x-full w-[20px] border-foreground border-r-2 ${index2 % 2 === 0 ? "border-t-2 top-1/2 translate-y-[1px] rounded-tr" : "border-b-2 bottom-1/2 -tranlate-y-[1px] rounded-br"}`} style={{ height: `${2 ** (index1) * 36}px` }} />}
                  {index1 !== 0 && <div className={`absolute left-0 top-1/2 -translate-x-full h-[2px] w-[22px] bg-foreground`} />}
                </div>
              ))
            }
          </div>
        ))
      }
    </div>
  )
}