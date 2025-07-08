import React, { useState, useMemo } from 'react';
import type { Task } from "../lib/types";
import { Button } from "./ui/button";

const PRIORITY_MAP: Record<number, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
};
const CATEGORY_MAP: Record<number, string> = {
  1: "Work",
  2: "Personal",
  3: "Errands",
};

interface TaskListProps {
  tasks: Task[];
  onDeleteTask?: (id: number) => void;
  onEditTask?: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onDeleteTask, onEditTask }) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('due_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredTasks = useMemo(() => {
    let filtered = Array.isArray(tasks) ? tasks : [];
    if (filterStatus) {
      filtered = filtered.filter(task => task.status === filterStatus);
    }
    if (priorityFilter) {
      filtered = filtered.filter(task => String(task.priority_id) === priorityFilter);
    }
    if (categoryFilter) {
      filtered = filtered.filter(task => String(task.category_id) === categoryFilter);
    }
    if (search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(search.toLowerCase()))
      );
    }
    return filtered;
  }, [tasks, search, filterStatus, priorityFilter, categoryFilter, sortBy, sortOrder]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-2 py-1 w-full md:w-1/3"
        />
        <div className="flex gap-2 flex-wrap">
          {/* Filter by Status */}
          {/* Filter by Priority */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All Priorities</option>
            <option value="1">Low</option>
            <option value="2">Medium</option>
            <option value="3">High</option>
          </select>
          {/* Filter by Category */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All Categories</option>
            <option value="1">Work</option>
            <option value="2">Personal</option>
            <option value="3">Errands</option>
          </select>
          {/* <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="due_date">Due Date</option>
            <option value="priority_id">Priority ID</option>
            <option value="title">Title</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="border rounded px-2 py-1"
            aria-label="Toggle sort order"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button> */}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1200px] bg-white border rounded shadow text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Priority</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Due Date</th>
              <th className="px-4 py-2 text-left">Created At</th>
              <th className="px-4 py-2 text-left">Updated At</th>
              <th className="px-4 py-2 text-left sticky right-0 bg-white z-10">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-gray-500 py-4">No tasks found.</td>
              </tr>
            ) : (
              filteredTasks.map(task => (
                <tr key={task.task_id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{task.title}</td>
                  <td className="px-4 py-2">{task.description}</td>
                  <td className="px-4 py-2">{task.status}</td>
                  <td className="px-4 py-2">{PRIORITY_MAP[task.priority_id] || task.priority_id}</td>
                  <td className="px-4 py-2">{CATEGORY_MAP[task.category_id] || task.category_id}</td>
                  <td className="px-4 py-2">{task.due_date ? new Date(task.due_date).toLocaleDateString() : ""}</td>
                  <td className="px-4 py-2">{task.created_at ? new Date(task.created_at).toLocaleString() : ""}</td>
                  <td className="px-4 py-2">{task.updated_at ? new Date(task.updated_at).toLocaleString() : ""}</td>
                  <td className="px-4 py-2 flex gap-2 sticky right-0 bg-white z-10">
                    <Button variant="outline" size="sm" onClick={() => onEditTask && onEditTask(task)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDeleteTask && onDeleteTask(task.task_id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;
