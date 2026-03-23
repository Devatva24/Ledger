import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, ChartLineUp } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [bills, setBills] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, billsRes, tasksRes] = await Promise.all([
        axios.get(`${API}/dashboard/summary`),
        axios.get(`${API}/bills`),
        axios.get(`${API}/tasks`)
      ]);
      setSummary(summaryRes.data);
      setBills(billsRes.data.filter(b => !b.paid).slice(0, 5));
      setTasks(tasksRes.data.filter(t => !t.completed).slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Unpaid Bills',
      value: summary?.unpaid_bills || 0,
      total: `${summary?.total_bills || 0} total`,
      icon: ArrowUp,
      color: 'text-destructive'
    },
    {
      label: 'Monthly Subscriptions',
      value: `₹${(summary?.monthly_subscription_cost || 0).toFixed(2)}`,
      total: `${summary?.total_subscriptions || 0} active`,
      icon: ChartLineUp,
      color: 'text-secondary'
    },
    {
      label: 'Pending Tasks',
      value: summary?.pending_tasks || 0,
      total: `${summary?.total_tasks || 0} total`,
      icon: ArrowDown,
      color: 'text-primary'
    }
  ];

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2" data-testid="dashboard-title">Command Center</h1>
        <p className="text-muted-foreground">Your life admin at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="bg-surface border border-border p-6 rounded-none hover:bg-surface-hover transition-colors duration-200"
              data-testid={`stat-card-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.total}</p>
                </div>
                <Icon size={32} className={stat.color} weight="duotone" />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-surface border border-border p-6 rounded-none" data-testid="upcoming-bills-card">
          <h2 className="text-xl font-semibold mb-4 text-white">Upcoming Bills</h2>
          {bills.length === 0 ? (
            <p className="text-muted-foreground text-sm">No unpaid bills</p>
          ) : (
            <div className="space-y-3">
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex justify-between items-center p-3 bg-muted/20 border border-border hover:border-primary/30 transition-colors duration-200"
                  data-testid={`bill-item-${bill.id}`}
                >
                  <div>
                    <p className="text-white font-medium">{bill.name}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{bill.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold">₹{bill.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(bill.due_date), 'MMM dd')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="bg-surface border border-border p-6 rounded-none" data-testid="pending-tasks-card">
          <h2 className="text-xl font-semibold mb-4 text-white">Pending Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-sm">No pending tasks</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex justify-between items-center p-3 bg-muted/20 border border-border hover:border-secondary/30 transition-colors duration-200"
                  data-testid={`task-item-${task.id}`}
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{task.priority} priority</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{format(new Date(task.due_date), 'MMM dd')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}