import { headers } from "next/headers";
import { Card } from "@/components/ui/card";
import PollQRCode from "@/features/polls/PollQRCode";
import VoteForm from "@/features/polls/VoteForm";

type Poll = {
  id: string;
  question: string;
  options: string[];
};

const mockPolls: Record<string, Poll> = {
  "1": {
    id: "1",
    question: "What's your favorite frontend framework?",
    options: ["React", "Vue", "Svelte", "Angular"],
  },
  "2": {
    id: "2",
    question: "Pick a preferred CSS styling approach:",
    options: ["Tailwind CSS", "CSS Modules", "Styled Components", "Vanilla CSS"],
  },
};

export default async function PollDetailPage({
  params,
}: {
  params: { pollId: string };
}) {
  const pollId = Array.isArray(params.pollId) ? params.pollId[0] : params.pollId;
  const poll = mockPolls[pollId];

  const hdrs = headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "";
  const proto = hdrs.get("x-forwarded-proto") || "http";
  const pollUrl = host ? `${proto}://${host}/polls/${pollId}` : `/polls/${pollId}`;

  if (!poll) {
    return (
      <Card className="max-w-xl mx-auto p-6">
        <h2 className="text-xl font-semibold">Poll not found</h2>
      </Card>
    );
  }

  async function submitVote(_: any, formData: FormData) {
    "use server";
    const submittedPollId = String(formData.get("pollId"));
    const optionIndexRaw = formData.get("optionIndex");
    const optionIndex = typeof optionIndexRaw === "string" ? parseInt(optionIndexRaw, 10) : -1;

    if (!submittedPollId || Number.isNaN(optionIndex) || optionIndex < 0) {
      return { ok: false, message: "Invalid submission" };
    }

    // Mock side-effect: In a real app, insert into Supabase here.
    await new Promise((r) => setTimeout(r, 300));

    return { ok: true, message: "Thanks for voting!" };
  }

  return (
    <Card className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">{poll.question}</h2>
      <VoteForm pollId={poll.id} options={poll.options} action={submitVote} />
      <div className="mt-6">
        <PollQRCode pollUrl={pollUrl} />
      </div>
    </Card>
  );
}
