"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";

export default function PollDetailPage() {
  const { pollId } = useParams();
  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voteLoading, setVoteLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [votes, setVotes] = useState<number[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    async function fetchPollAndVotes() {
      const { data: pollData } = await supabase
        .from("polls")
        .select()
        .eq("id", pollId)
        .single();
      setPoll(pollData);
      if (pollData && Array.isArray(pollData.options)) {
        const { data: voteData } = await supabase
          .from("votes")
          .select("option_index")
          .eq("poll_id", pollId);
        const counts = new Array(pollData.options.length).fill(0);
        if (voteData) {
          voteData.forEach((v: any) => {
            if (typeof v.option_index === "number") counts[v.option_index]++;
          });
        }
        setVotes(counts);
        setTotalVotes(counts.reduce((a, b) => a + b, 0));
      }
      setLoading(false);
    }
    fetchPollAndVotes();
  }, [pollId, message]);

  const handleVote = async (optionIdx: number) => {
    setVoteLoading(true);
    setMessage("");
    const { error } = await supabase.from("votes").insert([
      {
        poll_id: pollId,
        option_index: optionIdx,
      },
    ]);
    if (error) {
      setMessage("Error recording vote: " + error.message);
    } else {
      setMessage("Vote recorded! Thank you for voting.");
    }
    setVoteLoading(false);
  };

  if (loading) return <div>Loading poll...</div>;
  if (!poll) return <div>Poll not found.</div>;

  return (
    <Card className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">{poll.question}</h2>
      <ul className="space-y-2 mb-4">
        {Array.isArray(poll.options) &&
          poll.options.map((option: string, idx: number) => {
            const count = votes[idx] || 0;
            const percent = totalVotes
              ? Math.round((count / totalVotes) * 100)
              : 0;
            return (
              <li
                key={option}
                className="flex items-center gap-4 justify-between"
              >
                <span className="flex-1">{option}</span>
                <button
                  className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/80 transition"
                  onClick={() => handleVote(idx)}
                  disabled={voteLoading}
                >
                  Vote
                </button>
                <span className="ml-4 text-xs text-muted-foreground min-w-[70px] text-center">
                  {count} votes ({percent}%)
                </span>
              </li>
            );
          })}
      </ul>
      {message && (
        <div className="mt-4 text-green-600 font-semibold">{message}</div>
      )}
      <div className="mt-6 text-sm text-muted-foreground">
        Total votes: {totalVotes}
      </div>
    </Card>
  );
}
