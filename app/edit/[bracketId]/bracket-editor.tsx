"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { matchesSchema } from "@/zodTypes";
import { useMemo, useState } from "react";
import { z } from "zod";
import updateMatches from "./update-matches";

export default function BracketEditor(props: { bracket: { name: string, description?: string | null, id: string }, matches: z.infer<typeof matchesSchema> }) {
  const [matches, setMatches] = useState(props.matches);
  const [currentScore1, setCurrentScore1] = useState("0");
  const [currentScore2, setCurrentScore2] = useState("0");
  const [currentTeam1, setCurrentTeam1] = useState<string | null>();
  const [currentTeam2, setCurrentTeam2] = useState<string | null>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numberOfPhase = useMemo(() => Math.max(...matches.map(match => match.phase)), [matches]);

  const [editDialogOpened, setEditDialogOpened] = useState(false);

  const { toast } = useToast();

  return (
    <div>
      <div className="grid pt-2 pb-4" style={{ gridTemplateColumns: `repeat(${numberOfPhase}, minmax(0, 1fr))`, width: `${numberOfPhase * 200}px` }}>
        {
          Array.from({ length: numberOfPhase }).map((_, index1) => (
            <div key={index1} className="flex flex-col gap-2 justify-around">
              {
                matches.filter(m => m.phase === index1 + 1).map((match, index2) => (
                  <div key={index2} className="p-2 flex flex-col justify-evenly rounded border border-border h-16 w-40 relative hover:border-primary transition-colors cursor-pointer" onClick={() => {
                    setCurrentScore1(match.score1?.toString() ?? "0");
                    setCurrentScore2(match.score2?.toString() ?? "0");
                    setCurrentTeam1(match.team1);
                    setCurrentTeam2(match.team2);
                    setCurrentIndex((index1 + 1) * index2);
                    setCurrentPhase(index1 + 1);
                    setEditDialogOpened(true);
                  }}>
                    <p className={`${!match.team1 && "text-muted-foreground"}`}>{match.team1 ?? "TBD"}</p>
                    <p className={`${!match.team2 && "text-muted-foreground"}`}>{match.team2 ?? "TBD"}</p>
                    {index1 !== numberOfPhase - 1 && <div className={`absolute right-0 translate-x-full w-[20px] border-foreground border-r-2 ${index2 % 2 === 0 ? "border-t-2 top-1/2 translate-y-[1px] rounded-tr" : "border-b-2 bottom-1/2 -tranlate-y-[1px] rounded-br"}`} style={{ height: `${2 ** (index1) * 36}px` }} />}
                    {index1 !== 0 && <div className={`absolute left-0 top-1/2 -translate-x-full h-[2px] w-[22px] bg-foreground`} />}
                  </div>
                ))
              }
            </div>
          ))
        }
      </div>
      <Dialog onOpenChange={setEditDialogOpened} open={editDialogOpened}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="tracking-wide">Edit Result</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-[calc(50%-30px)_60px_calc(50%-30px)] items-center gap-[20px_0]">
            <p className="text-2xl tracking-wider text-right">{currentTeam1 ?? "TBD"}</p>
            <p className="text-4xl text-center">VS</p>
            <p className="text-2xl tracking-wider">{currentTeam2 ?? "TBD"}</p>
            <div className="flex justify-end">
              <Input disabled={!(currentTeam1 && currentTeam2)} className="w-16 text-2xl text-center py-6" type="string" value={currentScore1} onChange={(e) => setCurrentScore1(e.target.value)} />
            </div>
            <p className="text-xl text-center">-</p>
            <Input disabled={!(currentTeam1 && currentTeam2)} className="w-16 text-2xl text-center py-6" type="string" value={currentScore2} onChange={(e) => setCurrentScore2(e.target.value)} />
          </div>
          {error && <p className="text-destructive">{error}</p>}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={!(currentTeam1 && currentTeam2)}>Save result</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure ?</AlertDialogTitle>
                <AlertDialogDescription>By saving the match, the team who got the highest score will be defined as the winner and advance to the next match</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction disabled={saving} onClick={() => {
                  let newMatches = [...matches];
                  if (Number.isNaN(parseInt(currentScore1)) || Number.isNaN(parseInt(currentScore2))) {
                    toast({ title: "Invalid score", description: "Please enter a valid score", variant: "destructive" });
                  }

                  if (parseInt(currentScore1) === parseInt(currentScore2)) {
                    toast({ title: "Invalid score", description: "There can be no equality", variant: "destructive" });
                    return;
                  }
                  newMatches = matches.map((match, index) => index === currentIndex ? { ...match, score1: parseInt(currentScore1), score2: parseInt(currentScore2) } : match)
                  const winningTeam = parseInt(currentScore1) > parseInt(currentScore2) ? currentTeam1 : currentTeam2;
                  if (!winningTeam) return;
                  const matchCountInPreviousPhase = matches.filter(m => m.phase <= currentPhase).length;
                  const nextMatchIndex = Math.round((currentIndex + 1) / 2) + matchCountInPreviousPhase - 1;
                  if (currentIndex % 2 === 0) {
                    newMatches[nextMatchIndex].team1 = winningTeam;
                  } else {
                    newMatches[nextMatchIndex].team2 = winningTeam;
                  }

                  const updateMatchesFunc = async () => {
                    setSaving(true);
                    setError(null);
                    const updatedMatches = await updateMatches(newMatches, props.bracket.id);
                    setSaving(false);

                    if (updatedMatches.error) {
                      setError(updatedMatches.error);
                      return;
                    }

                    if (updatedMatches.data) {
                      setMatches(updatedMatches.data);
                    }
                  }
                  updateMatchesFunc();

                  setMatches(newMatches);
                  setEditDialogOpened(false);
                }}>
                  Save
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogContent>
      </Dialog>
    </div>
  )
}