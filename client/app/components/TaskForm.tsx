// TaskForm.tsx - Form for creating and editing tasks using shadcn/ui
import React, { useEffect, useState, useRef } from "react";
import type { Task, TaskCreate, TaskUpdate } from "~/lib/types";
import { Input } from "./ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Label } from "./ui/label";
import { ChevronDownIcon } from "lucide-react";
import { useAuth } from "../lib/authContext";

interface PriorityOption {
  id: number;
  name: string;
}

interface CategoryOption {
  id: number;
  name: string;
}

interface TaskFormProps {
  initialValues?: Partial<Task | null>;
  onSubmit: (data: TaskCreate | TaskUpdate) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialValues = {},
  onSubmit,
  loading = false,
  error = null,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [priorityId, setPriorityId] = useState(initialValues?.priority_id || "");
  const [categoryId, setCategoryId] = useState(initialValues?.category_id || "");
  const [dueDate, setDueDate] = useState(initialValues?.due_date || "");
  const [formError, setFormError] = useState<string | null>(null);
  const [priorities, setPriorities] = useState<PriorityOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // TODO: Replace with real API call
    setPriorities([
      { id: 1, name: "Low" },
      { id: 2, name: "Medium" },
      { id: 3, name: "High" },
    ]);
    setCategories([
      { id: 1, name: "Work" },
      { id: 2, name: "Personal" },
      { id: 3, name: "Errands" },
    ]);
  }, []);

  const validate = () => {
    if (!title.trim()) return "Title is required.";
    if (!description) return "Priority is required.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    try {
      // Use user from useAuth hook
      console.log(user);
      let user_id =  user?.user_id;
      if (!user_id) {
        setFormError("User ID is required.");
        return;
      }
      if (!title.trim()) {
        setFormError("Title is required.");
        return;
      }
      if (!description.trim()) {
        setFormError("Description is required.");
        return;
      }
      await onSubmit({
        user_id: user_id,
        title,
        description,
        priority_id: priorityId ? Number(priorityId) : undefined,
        category_id: categoryId ? Number(categoryId) : undefined,
        due_date: dueDate ? new Date(dueDate) : undefined,
      });
    } catch (submitError: any) {
      setFormError(submitError?.message || "Failed to submit");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <label className="block mb-1">Title</label>
        <Input value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="block mb-1">Description</label>
        <Input value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="block mb-1">Priority</label>
        <Select value={priorityId.toString()} onValueChange={v => setPriorityId(v)} required>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Priority</SelectLabel>
              {priorities.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block mb-1">Category</label>
        <Select value={categoryId.toString()} onValueChange={v => setCategoryId(v)} required>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Category</SelectLabel>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="due-date" className="block mb-1">Due Date</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="due-date"
              className="w-48 justify-between font-normal"
              type="button"
            >
              {dueDate ? new Date(dueDate).toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate ? new Date(dueDate) : undefined}
              onSelect={date => {
                setDueDate(date ? date.toISOString().split('T')[0] : "");
                setOpen(false);
              }}
              required
            />
          </PopoverContent>
        </Popover>
      </div>
      {(formError || error) && (
        <div className="text-red-500 text-sm">{formError || error}</div>
      )}
      <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Task"}</Button>
    </form>
  );
};

export default TaskForm;
