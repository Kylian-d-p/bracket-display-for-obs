"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { matchesSchema } from "@/zodTypes";
import { Plus, Trash } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import createBracketsAndMatches from "./create-brackets-and-matches";
import Link from "next/link";

export default function BracketCreator() {
  const [selectedTypeofBracket, setSelectedTypeofBracket] = useState<"single-elimination" | "double-elimination" | null>("single-elimination");
  const [teams, setTeams] = useState<string[]>(["WILL", "Les frénétiques", "Ta Gueule Esport", "Erec'tiks", "Team Rocket", "Béchamel 4", "Suprématie", "Benoit sex gang", "WILL", "Les frénétiques", "Ta Gueule Esport", "Erec'tiks", "Team Rocket", "Béchamel 4", "Suprématie", "Benoit sex gang"]);
  const [matches, setMatches] = useState<z.infer<typeof matchesSchema>>([]);
  const [bracketName, setBracketName] = useState<string>("");
  const [bracketDescription, setBracketDescription] = useState<string>("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedBracketId, setSavedBracketId] = useState<string | null>(null);

  const numberOfPhase = useMemo(() => Math.max(...matches.map(match => match.phase)), [matches]);

  const { toast } = useToast();

  const generateMatches = useCallback(() => {
    if (selectedTypeofBracket === "single-elimination") {
      const generatedMatches: z.infer<typeof matchesSchema> = [];
      const teamsCopy = [...teams];

      if (teamsCopy.length > 64) {
        toast({ title: "Error", description: "The number of teams must be less than 64", variant: "destructive" });
        return
      }

      let isPowerOfTwo = false;
      for (let i = 0; i < 64; i++) {
        if (Math.pow(2, i) === teamsCopy.length) {
          isPowerOfTwo = true;
          break;
        }
      }

      if (!isPowerOfTwo) {
        toast({ title: "Error", description: "The number of teams must be a power of 2", variant: "destructive" });
        return
      }

      let allTeamsAreCompleted = true;
      for (let i = 0; i < teamsCopy.length; i++) {
        if (!teamsCopy[i]) {
          allTeamsAreCompleted = false;
          break;
        }
      }
      if (!allTeamsAreCompleted) {
        toast({ title: "Error", description: "All teams must be completed", variant: "destructive" });
        return
      }


      while (teamsCopy.length > 1) {
        const team1 = teamsCopy.shift();
        const team2 = teamsCopy.pop();
        if (team1 && team2) {
          generatedMatches.push({
            team1,
            team2,
            score1: null,
            score2: null,
            date: null,
            phase: 1,
          });
        }
      }
      const calculatedPhaseNumber = Math.ceil(Math.log2(teams.length));
      // generate other phases with tbd teams
      for (let i = 2; i <= calculatedPhaseNumber; i++) {
        for (let j = 0; j < teams.length / Math.pow(2, i); j++) {
          generatedMatches.push({
            team1: null,
            team2: null,
            score1: null,
            score2: null,
            date: null,
            phase: i,
          });
        }
      }
      setMatches(generatedMatches);
    }
  }, [selectedTypeofBracket, teams, toast]);

  useEffect(() => {
    const container = document.querySelector('#bracket-overview') as HTMLElement;

    let startY: number;
    let startX: number;
    let scrollLeft: number;
    let scrollTop: number;
    let isDown: boolean = false;

    if (!container) return;

    container.addEventListener('mousedown', e => { mouseIsDown(e as MouseEvent) });
    container.addEventListener('mouseup', () => mouseUp())
    container.addEventListener('mouseleave', () => mouseLeave());
    container.addEventListener('mousemove', e => mouseMove(e as MouseEvent));

    function mouseIsDown(e: MouseEvent) {
      if (!container) return;
      isDown = true;
      startY = e.pageY - container.offsetTop;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      scrollTop = container.scrollTop;
    }

    function mouseUp() {
      isDown = false;
    }

    function mouseLeave() {
      isDown = false;
    }

    function mouseMove(e: MouseEvent) {
      if (!container) return;
      if (!isDown) return;
      e.preventDefault();

      // Move vertically
      // Should scroll window, not the container
      const y = e.pageY - container.offsetTop;
      const walkY = y - startY;
      container.scrollTop = scrollTop - walkY;

      // Move Horizontally
      const x = e.pageX - container.offsetLeft;
      const walkX = x - startX;
      container.scrollLeft = scrollLeft - walkX;
    }

    return () => {
      container.removeEventListener('mousedown', mouseIsDown);
      container.removeEventListener('mouseup', mouseUp);
      container.removeEventListener('mouseleave', mouseLeave);
      container.removeEventListener('mousemove', mouseMove);
    }
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <Dialog open={Boolean(savedBracketId)} onOpenChange={(opened) => !opened && setSavedBracketId(null)}>
        <DialogContent>
          <DialogTitle className="tracking-wide">Bracket has been saved successfully</DialogTitle>
          <DialogDescription>To access your overlay, you must go to the <Button size={"nopad"} variant={"link"}><Link target="_blank" href={`/edit/${savedBracketId}`}>editing page</Link></Button>.</DialogDescription>
          <Button onClick={() => setSavedBracketId(null)}>Close</Button>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col gap-2">
        <p className="text-xl">Name of bracket :</p>
        <Input placeholder="Name of the bracket" value={bracketName} onChange={(e) => setBracketName(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xl">Description of bracket :</p>
        <Input placeholder="Optional" value={bracketDescription} onChange={(e) => setBracketDescription(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xl">Type of bracket :</p>
        <Select onValueChange={(value) => {
          if (value === "single-elimination") {
            setSelectedTypeofBracket("single-elimination");
          } else if (value === "double-elimination") {
            setSelectedTypeofBracket("double-elimination");
          }
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select the type of bracket" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Type of brackets</SelectLabel>
              <SelectItem value="single-elimination">Single Elimination</SelectItem>
              <SelectItem value="double-elimination">Double Elimination</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xl">Teams :</p>
        <div className="flex flex-col gap-2">
          {
            teams.map((team, index) => (
              <div className="flex items-center gap-2" key={index}>
                <Input placeholder={`Team ${index + 1}`} value={team} onChange={(e) => setTeams(c => { const newC = [...c]; newC[index] = e.target.value; return newC })} />
                <Button variant={"secondary"} onClick={() => setTeams(prevTeams => prevTeams.filter((_, i) => i !== index))}><Trash /></Button>
              </div>
            ))
          }
        </div>
        <Button className="flex items-center gap-1" variant={"secondary"} onClick={() => setTeams([...teams, ""])}><Plus className="w-5 h-5" /> Add team</Button>
      </div>
      <p className="text-xl">Bracket Overview :</p>
      {
        !selectedTypeofBracket ? <p className="text-muted-foreground">You have to select the type of bracket</p>
          : selectedTypeofBracket === "single-elimination" ?
            <div className="flex flex-col gap-2">
              <Button variant={"secondary"} onClick={generateMatches}>{matches.length > 0 ? "Regenerate matches" : "Generate matches"}</Button>
              <div className="overflow-auto w-full select-none cursor-grab active:cursor-grabbing" id="bracket-overview">
                <div className="grid pt-2 pb-4" style={{ gridTemplateColumns: `repeat(${numberOfPhase}, minmax(0, 1fr))`, width: `${numberOfPhase * 200}px` }}>
                  {
                    Array.from({ length: numberOfPhase }).map((_, index1) => (
                      <div key={index1} className="flex flex-col gap-2 justify-around">
                        {
                          matches.filter(m => m.phase === index1 + 1).map((match, index2) => (
                            <div key={index2} className="p-2 flex flex-col justify-evenly rounded border border-border h-16 w-40 relative">
                              <p className={`${!match.team1 && "text-muted-foreground"}`}>{match.team1 ?? "TBD"}</p>
                              <p className={`${!match.team1 && "text-muted-foreground"}`}>{match.team2 ?? "TBD"}</p>
                              {index1 !== numberOfPhase - 1 && <div className={`absolute right-0 translate-x-full w-[20px] border-foreground border-r-2 ${index2 % 2 === 0 ? "border-t-2 top-1/2 translate-y-[1px] rounded-tr" : "border-b-2 bottom-1/2 -tranlate-y-[1px] rounded-br"}`} style={{ height: `${2 ** (index1) * 36}px` }} />}
                              {index1 !== 0 && <div className={`absolute left-0 top-1/2 -translate-x-full h-[2px] w-[22px] bg-foreground`} />}
                            </div>
                          ))
                        }
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            : null
      }
      {saveError && <p className="text-destructive w-full text-center">{saveError}</p>}
      {
        matches.length > 0 && <Button disabled={saving} onClick={async () => {
          setSaveError(null);
          setSaving(true);
          const saveAction = await createBracketsAndMatches({ name: bracketName, description: bracketDescription }, matches)

          if (saveAction.error) {
            setSaveError(saveAction.error);
          }
          if (saveAction.bracketId) {
            setSavedBracketId(saveAction.bracketId);
          }
          setSaving(false);
        }}>Save</Button>
      }
    </div>
  )
}