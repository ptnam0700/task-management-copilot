import React, { useState, useEffect } from "react";
import TaskForm from "~/components/TaskForm";
import { TaskAPI } from "~/lib/api";
import TaskList from "~/components/TaskList";
import type { Task } from "~/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "../components/ui/dialog";
import { toast } from "sonner";

const TaskNewRoute = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [filter, setFilter] = useState<{ priority_id?: number; category_id?: number; status?: string }>({});

  const fetchTasks = async () => {
    setTasksLoading(true);
    setTasksError(null);
    try {
      const data = await TaskAPI.getAll(filter);
      setTasks(data);
    } catch (err: any) {
      setTasksError(err?.message || "Failed to load tasks");
    } finally {
      setTasksLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : value,
    }));
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, [filter]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await TaskAPI.create(data);
      setSuccess(true);
      fetchTasks(); // Refresh task list after create
      toast.success("Task created successfully!");
      // Clear form by resetting key
      setFormKey(prev => prev + 1);
    } catch (err: any) {
      setError(err?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setShowEditModal(true);
  };

  const handleUpdateTask = async (data: any) => {
    if (!editTask) return;
    setLoading(true);
    setError(null);
    try {
      await TaskAPI.update(editTask.task_id, data);
      setShowEditModal(false);
      setEditTask(null);
      fetchTasks();
      toast.success("Task updated successfully!");
    } catch (err: any) {
      setError(err?.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      <div className="md:w-1/3 w-full">
        <h1 className="text-2xl font-bold mb-4">Create Task</h1>
        <TaskForm key={formKey} onSubmit={handleSubmit} loading={loading} error={error} />
        {success && <div className="text-green-600 mt-4">Task created successfully!</div>}
      </div>
      <div className="md:w-2/3 w-full">
        <h2 className="text-xl font-semibold mb-2">Task List</h2>
        {tasksLoading ? (
          <div className="text-gray-500 p-4">Loading tasks...</div>
        ) : tasksError ? (
          <div className="text-red-500 p-4">{tasksError}</div>
        ) : (
          <TaskList tasks={tasks} onDeleteTask={async (id) => { await TaskAPI.delete(id); fetchTasks(); }} onEditTask={handleEditTask} />
        )}
      </div>
      {showEditModal && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogClose asChild>
              </DialogClose>
            </DialogHeader>
            <TaskForm initialValues={editTask} onSubmit={handleUpdateTask} loading={loading} error={error} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TaskNewRoute;
