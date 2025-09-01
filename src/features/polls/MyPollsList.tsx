"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";

export default function MyPollsList() {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [voteCounts, setVoteCounts] = useState<Record<string, number[]>>({});

  useEffect(() => {
    async function fetchPolls() {
      setError("");
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        return;
      }
      const userId = session?.user?.id;
      const { data, error } = await supabase
        .from("polls")
        .select()
        .eq("owner_id", userId || "");
      if (error) {
        setError(error.message);
        setPolls([]);
      } else {
        const pollsData = data || [];
        setPolls(pollsData);
        // Fetch vote counts per poll
        const pollIds = pollsData.map((p: any) => p.id);
        if (pollIds.length) {
          const { data: votesData } = await supabase
            .from("votes")
            .select("poll_id, option_index")
            .in("poll_id", pollIds);
          const countsMap: Record<string, number[]> = {};
          pollsData.forEach((p: any) => {
            const counts = new Array((p.options || []).length).fill(0);
            countsMap[p.id] = counts;
          });
          (votesData || []).forEach((v: any) => {
            const arr = countsMap[v.poll_id];
            if (arr && typeof v.option_index === "number") {
              arr[v.option_index] = (arr[v.option_index] || 0) + 1;
            }
          });
          setVoteCounts(countsMap);
        }
      }
      setLoading(false);
    }
    fetchPolls();
  }, []);

  const handleDelete = async (pollId: string) => {
    setDeletingId(pollId);
    setError("");
    const { error } = await supabase.from("polls").delete().eq("id", pollId);
    if (error) {
      setError(error.message);
    } else {
      setPolls((prev) => prev.filter((p) => p.id !== pollId));
    }
    setDeletingId(null);
  };

  if (loading) return <div>Loading polls...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!polls.length) return <div>No polls found.</div>;
  return (
    <div className="space-y-6">
      {polls.map((poll) => (
        <Card key={poll.id} className="p-6">
          <h3 className="text-lg font-semibold mb-2">{poll.question}</h3>
          <ul className="space-y-2 mb-4">
            {Array.isArray(poll.options) &&
              poll.options.map((option: string, idx: number) => (
                <li
                  key={option}
                  className="flex items-center gap-4 justify-between"
                >
                  <span className="flex-1">{option}</span>
                  <span className="bg-muted px-2 py-1 rounded text-xs min-w-[70px] text-center">
                    {(voteCounts[poll.id]?.[idx] || 0)} votes
                  </span>
                </li>
              ))}
          </ul>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/80 transition">
              View Results
            </button>
            <button className="px-3 py-1 bg-muted rounded hover:bg-muted/80 transition">
              Edit
            </button>
            <button
              onClick={() => handleDelete(poll.id)}
              disabled={deletingId === poll.id}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-60"
            >
              {deletingId === poll.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
