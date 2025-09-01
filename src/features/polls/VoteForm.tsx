"use client";
import { useEffect, useState, useTransition } from "react";
import { useFormState } from "react-dom";

type VoteResult = {
  ok: boolean;
  message?: string;
};

type Props = {
  pollId: string;
  options: string[];
  action: (state: VoteResult | null, formData: FormData) => Promise<VoteResult>;
};

export default function VoteForm({ pollId, options, action }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [state, formAction] = useFormState(action, null);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (state?.ok) {
      setSubmitted(true);
    }
  }, [state]);

  if (submitted) {
    return (
      <div className="mt-4">
        <div className="rounded border p-4 bg-muted/40">
          <p className="font-medium">Thank you for voting!</p>
          <p className="text-sm text-muted-foreground">Results will appear here soon.</p>
        </div>
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        if (selectedIndex === null) return;
        formData.set("pollId", pollId);
        formData.set("optionIndex", String(selectedIndex));
        startTransition(() => {
          formAction(formData);
        });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        {options.map((option, idx) => (
          <label key={option} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="option"
              value={idx}
              checked={selectedIndex === idx}
              onChange={() => setSelectedIndex(idx)}
              className="h-4 w-4"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>

      {state && !state.ok && state.message && (
        <div className="text-red-600 text-sm">{state.message}</div>
      )}

      <button
        type="submit"
        disabled={selectedIndex === null || isPending}
        className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit Vote"}
      </button>
    </form>
  );
}


