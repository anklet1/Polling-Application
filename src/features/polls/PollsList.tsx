import { Card } from "@/components/ui/card";

const samplePolls = [
  {
    id: 1,
    question: "What's your favorite programming language?",
    options: ["JavaScript", "Python", "TypeScript", "Go"],
    votes: [5, 8, 3, 2],
  },
  {
    id: 2,
    question: "Which frontend framework do you prefer?",
    options: ["React", "Vue", "Angular", "Svelte"],
    votes: [10, 4, 2, 1],
  },
];

export default function PollsList() {
  return (
    <div className="space-y-6">
      {samplePolls.map((poll) => (
        <Card key={poll.id} className="p-6">
          <h3 className="text-lg font-semibold mb-2">{poll.question}</h3>
          <ul className="space-y-2">
            {poll.options.map((option, idx) => (
              <li
                key={option}
                className="flex items-center gap-4 justify-between"
              >
                <span className="flex-1">{option}</span>
                <span className="bg-muted px-2 py-1 rounded text-xs min-w-[70px] text-center">
                  {poll.votes[idx]} votes
                </span>
                <button className="ml-4 px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/80 transition">
                  Vote
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
