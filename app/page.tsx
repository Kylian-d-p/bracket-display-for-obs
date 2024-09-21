import ThemeToggle from "@/components/theme/theme-toggle";
import BracketCreator from "./bracket-creator";

export default function Home() {
  return (
    <>
      <div className="p-2 flex items-center justify-between gap-2 shadow-sm">
        <h1 className="text-3xl">CREATE YOUR BRACKET OVERLAY FOR OBS</h1>
        <ThemeToggle />
      </div>
      <main className="w-[calc(100%-20px) max-w-2xl mx-auto py-2 w-full">
        <BracketCreator />
      </main>
    </>
  );
}
