import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'pending' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/tasks', config);
      setTasks(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch tasks');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/v1/tasks/${editId}`, formData, config);
        toast.success('Task updated');
      } else {
        await axios.post('http://localhost:5000/api/v1/tasks', formData, config);
        toast.success('Task created');
      }
      setFormData({ title: '', description: '', status: 'pending' });
      setIsEditing(false);
      setEditId(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (task) => {
    setFormData({ title: task.title, description: task.description, status: task.status });
    setIsEditing(true);
    setEditId(task._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/tasks/${id}`, config);
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">{isEditing ? 'Edit Task' : 'Add New Task'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              {isEditing ? 'Update' : 'Create'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ title: '', description: '', status: 'pending' });
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="md:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Your Tasks</h3>
        <div className="grid gap-4">
          {tasks.length === 0 ? (
            <p className="text-gray-500 bg-white p-6 rounded-xl border border-gray-100 text-center">No tasks found. Create one!</p>
          ) : (
            tasks.map(task => (
              <div key={task._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{task.title}</h4>
                  <p className="text-gray-600 mt-1">{task.description}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                    {user.role === 'admin' && task.user && (
                      <span className="text-xs text-gray-500 bg-indigo-50 px-2 py-1 rounded">
                        User: {task.user.name || task.user}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2 justify-start sm:justify-center">
                  <button
                    onClick={() => handleEdit(task)}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
