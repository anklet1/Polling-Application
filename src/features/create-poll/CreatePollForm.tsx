"use client";
import { useEffect, useState, useTransition } from "react";
import { useActionState } from "react"; // ✅ correct import
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { createPollAction } from "@/lib/actions/createPoll";

export default function CreatePollForm() {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(createPollAction, null);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg rounded-2xl border border-gray-200">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Create a New Poll
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={formAction}
          className="space-y-4"
        >
          {/* Poll Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Poll Title</label>
            <Input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your poll title"
              required
              className="focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Poll Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Options</label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <Input
                  key={index}
                  type="text"
                  name={`option-${index}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                  className="focus:ring-2 focus:ring-primary/50"
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleAddOption}
            >
              + Add Option
            </Button>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Creating..." : "Create Poll"}
          </Button>

          {/* Status / Errors */}
          {state?.ok && (
            <p className="text-sm text-green-500 mt-2">Poll created successfully</p>
          )}
          {state?.ok && (
            <p className="text-sm text-red-500 mt-2">{state.message}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
