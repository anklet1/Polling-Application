"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

type Poll = {
  id: string;
  question: string;
  options: string[];
};

export default function PollsList() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchPolls() {
      setError("");
      const { data, error } = await supabase
        .from("polls")
        .select("id, question, options")
        .order("created_at", { ascending: false });
      if (error) {
        setError(error.message);
        setPolls([]);
      } else {
        setPolls((data as Poll[]) || []);
      }
      setLoading(false);
    }
    fetchPolls();
  }, []);

  if (loading) return <div>Loading polls...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!polls.length) return <div>No polls found.</div>;

  return (
    <div className="space-y-6">
      {polls.map((poll) => (
        <Card key={poll.id} className="p-6">
          <h3 className="text-lg font-semibold mb-2">{poll.question}</h3>
          <div className="flex gap-3">
            <Link
              href={`/polls/${poll.id}`}
              className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/80 transition"
            >
              View & Vote
            </Link>
            <Link
              href={`/polls/${poll.id}`}
              className="px-3 py-1 bg-muted rounded hover:bg-muted/80 transition"
            >
              See Results
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
