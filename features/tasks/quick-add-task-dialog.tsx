"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function QuickAddTaskDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("personal");
  const [priority, setPriority] = useState("medium");

  function handleCreateTask() {
    if (!title.trim()) {
      return;
    }

    console.log({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
    });

    setTitle("");
    setDescription("");
    setCategory("personal");
    setPriority("medium");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-2 rounded-xl" />}>
        <Plus className="size-4" />
        Add Task
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a new task</DialogTitle>

          <DialogDescription>
            Add something you need to remember. You can organize and schedule
            it later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <label
              htmlFor="task-title"
              className="text-sm font-medium"
            >
              Task title
            </label>

            <Input
              id="task-title"
              placeholder="What do you need to do?"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="task-description"
              className="text-sm font-medium"
            >
              Description
              <span className="ml-1 font-normal text-muted-foreground">
                (optional)
              </span>
            </label>

            <Textarea
              id="task-description"
              placeholder="Add more details..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-24 resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Category
              </label>

              <Select
                value={category}
                onValueChange={(value) => {
                  // Values line up with TASK_CATEGORIES in ./task.types; the
                  // reusable Zod schema in step 2 will validate them properly.
                  if (value) {
                    setCategory(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="personal">
                    Personal
                  </SelectItem>

                  <SelectItem value="locked">
                    Locked
                  </SelectItem>

                  <SelectItem value="office">
                    Office & Academics
                  </SelectItem>

                  <SelectItem value="miscellaneous">
                    Miscellaneous
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Priority
              </label>

              <Select
                value={priority}
                onValueChange={(value) => {
                  if (value) {
                    setPriority(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={handleCreateTask}
            disabled={!title.trim()}
          >
            <Plus className="size-4" />
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}