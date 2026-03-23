import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash, CheckCircle, Circle, PencilSimple } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const emptyForm = { title: '', description: '', due_date: '', priority: 'medium' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('due_date');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API}/tasks`);
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to load tasks');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await axios.put(`${API}/tasks/${editingTask.id}`, formData);
        toast.success('Task updated successfully');
      } else {
        await axios.post(`${API}/tasks`, formData);
        toast.success('Task added successfully');
      }
      setOpen(false);
      setEditingTask(null);
      setFormData(emptyForm);
      fetchTasks();
    } catch (error) {
      toast.error(editingTask ? 'Failed to update task' : 'Failed to add task');
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date.split('T')[0],
      priority: task.priority,
    });
    setOpen(true);
  };

  const openAdd = () => {
    setEditingTask(null);
    setFormData(emptyForm);
    setOpen(true);
  };

  const toggleComplete = async (task) => {
    try {
      await axios.put(`${API}/tasks/${task.id}`, { completed: !task.completed });
      toast.success(task.completed ? 'Marked as incomplete' : 'Task completed');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const deleteTask = async () => {
    try {
      await axios.delete(`${API}/tasks/${deletingId}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-primary';
      case 'low': return 'text-secondary';
      default: return 'text-muted-foreground';
    }
  };

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const filtered = tasks
    .filter(t => {
      if (filter === 'pending') return !t.completed;
      if (filter === 'completed') return t.completed;
      if (filter === 'high') return t.priority === 'high' && !t.completed;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'due_date') return new Date(a.due_date) - new Date(b.due_date);
      if (sort === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
      if (sort === 'name') return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <div className="space-y-8" data-testid="tasks-page">
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This cannot be undone."
        onConfirm={deleteTask}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Tasks</h1>
          <p className="text-muted-foreground">Track your deadlines and to-dos</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingTask(null); setFormData(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="bg-primary text-black hover:bg-primary/90 rounded-none font-semibold">
              <Plus size={20} weight="bold" className="mr-2" />Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface border border-border rounded-none">
            <DialogHeader>
              <DialogTitle className="text-white">{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Task Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-muted border-border rounded-none text-white mt-1" required />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Description</Label>
                <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-muted border-border rounded-none text-white mt-1" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Due Date</Label>
                <Input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} className="bg-muted border-border rounded-none text-white mt-1" required />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                  <SelectTrigger className="bg-muted border-border rounded-none text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface border-border rounded-none">
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90 rounded-none font-semibold">
                {editingTask ? 'Update Task' : 'Add Task'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Filter</Label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="bg-muted border-border rounded-none text-white mt-1 w-40"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-surface border-border rounded-none">
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Sort By</Label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="bg-muted border-border rounded-none text-white mt-1 w-36"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-surface border-border rounded-none">
              <SelectItem value="due_date">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.length === 0 ? (
          <Card className="bg-surface border border-border p-8 rounded-none text-center">
            <p className="text-muted-foreground">No tasks found.</p>
          </Card>
        ) : (
          filtered.map((task) => (
            <Card key={task.id} className={`bg-surface border p-4 rounded-none hover:border-primary/30 transition-colors duration-200 ${task.completed ? 'border-border opacity-60' : 'border-border'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <button onClick={() => toggleComplete(task)} className="text-muted-foreground hover:text-secondary transition-colors duration-200 mt-1">
                    {task.completed ? <CheckCircle size={24} weight="fill" className="text-secondary" /> : <Circle size={24} />}
                  </button>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${task.completed ? 'line-through text-muted-foreground' : 'text-white'}`}>{task.title}</h3>
                    {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                    <div className="flex gap-4 mt-2">
                      <span className={`text-xs uppercase tracking-wider font-semibold ${getPriorityColor(task.priority)}`}>{task.priority} priority</span>
                      <span className="text-xs text-muted-foreground">Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <button onClick={() => openEdit(task)} className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    <PencilSimple size={20} />
                  </button>
                  <button onClick={() => confirmDelete(task.id)} className="text-muted-foreground hover:text-destructive transition-colors duration-200">
                    <Trash size={20} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}