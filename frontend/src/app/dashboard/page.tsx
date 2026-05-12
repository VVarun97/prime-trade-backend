"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  LogOut,
  Zap,
  LayoutDashboard,
  AlertCircle,
  Loader2,
  PlayCircle,
  ShieldCheck,
  Filter,
  Edit3,
  X,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  user?: { email: string; name?: string };
}

const STATUS_CYCLE: Record<string, "IN_PROGRESS" | "DONE"> = {
  PENDING: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
};

export default function DashboardPage() {
  const { user, token, isLoading, logout } = useAuth();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"PENDING" | "IN_PROGRESS" | "DONE">("PENDING");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !token) router.push("/login");
  }, [token, isLoading, router]);

  const fetchTasks = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTasks(data.tasks);
    } catch {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const flashSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("PENDING");
    setPriority("MEDIUM");
    setEditTask(null);
    setShowForm(false);
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status);
    setPriority(task.priority);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 3) {
      setError("Title must be at least 3 characters");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const url = editTask
        ? `${API_URL}/tasks/${editTask.id}`
        : `${API_URL}/tasks`;
      const method = editTask ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), status, priority }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save task");

      flashSuccess(editTask ? "Task updated!" : "Task created!");
      resetForm();
      fetchTasks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const advanceStatus = async (task: Task) => {
    if (task.status === "DONE") return;
    const next = STATUS_CYCLE[task.status];
    try {
      const res = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        flashSuccess(`Task moved to ${next.replace("_", " ")}`);
        fetchTasks();
      }
    } catch {
      setError("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        flashSuccess("Task deleted");
        fetchTasks();
      }
    } catch {
      setError("Failed to delete task");
    }
  };

  const filtered = filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);
  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "PENDING").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    done: tasks.filter((t) => t.status === "DONE").length,
  };

  if (isLoading || loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* ─── Navbar ─── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <Zap size={18} color="white" />
          </div>
          <span className="navbar-title">PrimeTrade AI</span>
        </div>
        <div className="navbar-actions">
          <div className="user-badge">
            <LayoutDashboard size={14} />
            <span>{user?.name || user?.email}</span>
            <span className={`role-badge ${user?.role === "ADMIN" ? "role-admin" : "role-user"}`}>
              {user?.role === "ADMIN" ? <><ShieldCheck size={10} /> Admin</> : "User"}
            </span>
          </div>
          <button id="logout-btn" className="btn btn-ghost btn-sm" onClick={logout}>
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <main className="main-content">
        {/* ─── Alerts ─── */}
        {error && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={15} />
            <span>{error}</span>
            <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
              <X size={14} />
            </button>
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="status">
            <CheckCircle size={15} />
            <span>{success}</span>
          </div>
        )}

        {/* ─── Stats ─── */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-label">Total Tasks</div>
            <div className="stat-value">{counts.all}</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{counts.pending}</div>
          </div>
          <div className="stat-card progress">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{counts.inProgress}</div>
          </div>
          <div className="stat-card done">
            <div className="stat-label">Done</div>
            <div className="stat-value">{counts.done}</div>
          </div>
        </div>

        {/* ─── Task Section ─── */}
        <div className="section-header">
          <h1 className="section-title">
            {user?.role === "ADMIN" ? "All Tasks (Admin View)" : "My Tasks"}
          </h1>
          <button
            id="add-task-btn"
            className="btn btn-primary btn-sm"
            onClick={() => { resetForm(); setShowForm(!showForm); }}
          >
            {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> New Task</>}
          </button>
        </div>

        {/* ─── Task Form ─── */}
        {showForm && (
          <div className="task-form-card">
            <h3 style={{ marginBottom: "1rem", fontSize: "1rem", color: "var(--text-main)" }}>
              <Edit3 size={15} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
              {editTask ? "Edit Task" : "Create New Task"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="task-title">Title *</label>
                <input
                  id="task-title"
                  type="text"
                  className="form-input"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="task-desc">Description</label>
                <input
                  id="task-desc"
                  type="text"
                  className="form-input"
                  placeholder="Optional details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="task-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="task-status">Status</label>
                  <select
                    id="task-status"
                    className="form-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as typeof status)}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="task-priority">Priority</label>
                  <select
                    id="task-priority"
                    className="form-input"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as typeof priority)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div className="task-form-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>
                  Cancel
                </button>
                <button id="task-submit-btn" type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 size={15} style={{ animation: "spin 0.7s linear infinite" }} /> Saving...</>
                  ) : (
                    <>{editTask ? <><CheckCircle size={15} /> Update</> : <><Plus size={15} /> Create Task</>}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── Filters ─── */}
        <div className="filters">
          <Filter size={14} style={{ color: "var(--text-dim)", marginTop: 6 }} />
          {[
            { key: "ALL", label: `All (${counts.all})` },
            { key: "PENDING", label: `Pending (${counts.pending})` },
            { key: "IN_PROGRESS", label: `In Progress (${counts.inProgress})` },
            { key: "DONE", label: `Done (${counts.done})` },
          ].map((f) => (
            <button
              key={f.key}
              id={`filter-${f.key.toLowerCase()}`}
              className={`filter-btn ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ─── Task List ─── */}
        <div className="task-list">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">No tasks found</div>
              <div className="empty-desc">
                {filter === "ALL"
                  ? "Create your first task to get started!"
                  : `No ${filter.toLowerCase().replace("_", " ")} tasks.`}
              </div>
            </div>
          ) : (
            filtered.map((task) => (
              <div key={task.id} className="task-card">
                <div className="task-info">
                  <div className={`task-title ${task.status === "DONE" ? "done" : ""}`}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="task-desc">{task.description}</div>
                  )}
                  <div className="task-meta">
                    <span className={`badge badge-${task.status === "IN_PROGRESS" ? "progress" : task.status.toLowerCase()}`}>
                      {task.status === "PENDING" && <Clock size={9} />}
                      {task.status === "IN_PROGRESS" && <PlayCircle size={9} />}
                      {task.status === "DONE" && <CheckCircle size={9} />}
                      {task.status.replace("_", " ")}
                    </span>
                    <span className={`badge badge-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    {user?.role === "ADMIN" && task.user && (
                      <span style={{ fontSize: "0.725rem", color: "var(--text-dim)" }}>
                        by {task.user.name || task.user.email}
                      </span>
                    )}
                    <span style={{ fontSize: "0.725rem", color: "var(--text-dim)" }}>
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="task-actions">
                  {task.status !== "DONE" && (
                    <button
                      id={`advance-${task.id}`}
                      className="btn btn-success btn-sm btn-icon"
                      onClick={() => advanceStatus(task)}
                      title={`Move to ${STATUS_CYCLE[task.status]?.replace("_", " ")}`}
                    >
                      {task.status === "PENDING" ? <PlayCircle size={15} /> : <CheckCircle size={15} />}
                    </button>
                  )}
                  <button
                    id={`edit-${task.id}`}
                    className="btn btn-secondary btn-sm btn-icon"
                    onClick={() => openEdit(task)}
                    title="Edit task"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    id={`delete-${task.id}`}
                    className="btn btn-danger btn-sm btn-icon"
                    onClick={() => handleDelete(task.id)}
                    title="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
