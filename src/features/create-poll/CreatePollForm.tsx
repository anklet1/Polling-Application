"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

export default function CreatePollForm() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const handleOptionChange = (idx: number, value: string) => {
    setOptions((opts) => opts.map((opt, i) => (i === idx ? value : opt)));
  };

  const addOption = () => {
    setOptions((opts) => [...opts, ""]);
  };

  const removeOption = (idx: number) => {
    setOptions((opts) => opts.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredOptions = options.filter(Boolean);
    if (!question || filteredOptions.length < 2) {
      alert("Please enter a question and at least two options.");
      return;
    }
    const { error } = await supabase.from("polls").insert([
      {
        question,
        options: filteredOptions,
      },
    ]);
    if (error) {
      alert("Error creating poll: " + error.message);
    } else {
      alert("Poll created successfully!");
      setQuestion("");
      setOptions(["", ""]);
    }
  };

  return (
    <Card className="max-w-xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Poll Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
            placeholder="Enter your poll question"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Answer Options</label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                className="flex-1 border rounded px-3 py-2"
                required
                placeholder={`Option ${idx + 1}`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  className="text-red-500"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="mt-2 px-3 py-1 bg-muted rounded"
          >
            Add Option
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-2 rounded font-semibold"
        >
          Create Poll
        </button>
      </form>
    </Card>
  );
}
