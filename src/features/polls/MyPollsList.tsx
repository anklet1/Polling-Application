"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";

export default function MyPollsList() {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPolls() {
      const { data, error } = await supabase.from("polls").select();
      if (error) {
        setPolls([]);
      } else {
        setPolls(data || []);
      }
      setLoading(false);
    }
    fetchPolls();
  }, []);

  if (loading) return <div>Loading polls...</div>;
  if (!polls.length) return <div>No polls found.</div>;
  return (
    <div className="space-y-6">
      {polls.map((poll) => (
        <Card key={poll.id} className="p-6">
          <h3 className="text-lg font-semibold mb-2">{poll.question}</h3>
          <ul className="space-y-2 mb-4">
            {Array.isArray(poll.options) && poll.options.map((option: string, idx: number) => (
              <li key={option} className="flex items-center gap-4 justify-between">
                <span className="flex-1">{option}</span>
                {/* Placeholder for votes */}
                <span className="bg-muted px-2 py-1 rounded text-xs min-w-[70px] text-center">0 votes</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/80 transition">View Results</button>
            <button className="px-3 py-1 bg-muted rounded hover:bg-muted/80 transition">Edit</button>
            <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition">Delete</button>
          </div>
        </Card>
      ))}
    </div>
  );
}
