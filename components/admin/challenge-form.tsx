"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeEditor } from "@/components/challenge/code-editor";
import {
  challengeSchema,
  type ChallengeFormData,
} from "@/lib/validations/challenge";
import { createChallenge, updateChallenge } from "@/lib/api/challenges";
import type { Challenge } from "@/types";
import { ApiClientError } from "@/lib/api/client";

interface ChallengeFormProps {
  challenge?: Challenge;
}

export function ChallengeForm({ challenge }: ChallengeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeSchema),
    defaultValues: challenge
      ? {
          title: challenge.title,
          description: challenge.description,
          problemStatement: challenge.problemStatement,
          starterCode: challenge.starterCode,
          testCases: challenge.testCases,
          evaluationPrompt: challenge.evaluationPrompt || "",
          difficulty: challenge.difficulty,
          baseXpReward: challenge.baseXpReward,
          bonusCoins: challenge.bonusCoins,
          weekNumber: challenge.weekNumber,
          year: challenge.year,
          isActive: challenge.isActive || false,
        }
      : {
          title: "",
          description: "",
          problemStatement: "",
          starterCode: "def solution():\n    pass",
          testCases: [{ input: "", expectedOutput: "" }],
          evaluationPrompt: "",
          difficulty: 2,
          baseXpReward: 100,
          bonusCoins: 10,
          weekNumber: undefined,
          year: new Date().getFullYear(),
          isActive: false,
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "testCases",
  });

  async function onSubmit(data: ChallengeFormData) {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        difficulty: data.difficulty as 1 | 2 | 3 | 4 | 5,
      };
      if (challenge) {
        await updateChallenge(challenge.id, payload);
        toast.success("Challenge updated");
      } else {
        await createChallenge(payload);
        toast.success("Challenge created");
      }
      router.push("/admin/challenges");
    } catch (error) {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to save challenge",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="FizzBuzz Challenge" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of the challenge"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="problemStatement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problem Statement</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed problem statement..."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Explain the problem in detail with examples
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Starter Code</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="starterCode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CodeEditor
                      value={field.value}
                      onChange={field.onChange}
                      height="200px"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Test Cases</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ input: "", expectedOutput: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Test Case
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <FormField
                    control={form.control}
                    name={`testCases.${index}.input`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Input {index + 1}</FormLabel>
                        <FormControl>
                          <Input placeholder="15" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`testCases.${index}.expectedOutput`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Output (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="FizzBuzz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-8"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(parseInt(v))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Very Easy</SelectItem>
                        <SelectItem value="2">Easy</SelectItem>
                        <SelectItem value="3">Medium</SelectItem>
                        <SelectItem value="4">Hard</SelectItem>
                        <SelectItem value="5">Very Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="baseXpReward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base XP Reward</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bonusCoins"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bonus Coins</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="weekNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Week Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="evaluationPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Evaluation Prompt (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional instructions for AI evaluation..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Custom instructions for the AI evaluator
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">
                    Active (make this the current challenge)
                  </FormLabel>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/challenges")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {challenge ? "Update Challenge" : "Create Challenge"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
