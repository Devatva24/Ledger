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
import { Plus, Trash, ArrowClockwise, PencilSimple } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [formData, setFormData] = useState({
    name: '', amount: '', renewal_date: '', category: 'streaming', billing_cycle: 'monthly', usage_frequency: 'regular'
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchSubscriptions(); }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(`${API}/subscriptions`);
      setSubscriptions(response.data.sort((a, b) => new Date(a.renewal_date) - new Date(b.renewal_date)));
    } catch (error) {
      toast.error('Failed to load subscriptions');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSub) {
        await axios.put(`${API}/subscriptions/${editingSub.id}`, {
          ...formData, amount: parseFloat(formData.amount)
        });
        toast.success('Subscription updated successfully');
      } else {
        await axios.post(`${API}/subscriptions`, {
          ...formData, amount: parseFloat(formData.amount)
        });
        toast.success('Subscription added successfully');
      }
      setOpen(false);
      setEditingSub(null);
      setFormData({ name: '', amount: '', renewal_date: '', category: 'streaming', billing_cycle: 'monthly', usage_frequency: 'regular' });
      fetchSubscriptions();
    } catch (error) {
      toast.error('Failed to save subscription');
    }
  };

  const openEdit = (sub) => {
    setEditingSub(sub);
    setFormData({
      name: sub.name,
      amount: sub.amount,
      renewal_date: sub.renewal_date.split('T')[0],
      category: sub.category,
      billing_cycle: sub.billing_cycle,
      usage_frequency: sub.usage_frequency,
    });
    setOpen(true);
  };

  const openAdd = () => {
    setEditingSub(null);
    setFormData({ name: '', amount: '', renewal_date: '', category: 'streaming', billing_cycle: 'monthly', usage_frequency: 'regular' });
    setOpen(true);
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const deleteSubscription = async () => {
    try {
      await axios.delete(`${API}/subscriptions/${deletingId}`);
      toast.success('Subscription deleted');
      fetchSubscriptions();
    } catch (error) {
      toast.error('Failed to delete subscription');
    }
  };

  const getTotalMonthlyCost = () => {
    return subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        if (s.billing_cycle === 'yearly') return sum + s.amount / 12;
        if (s.billing_cycle === 'quarterly') return sum + s.amount / 3;
        return sum + s.amount;
      }, 0)
      .toFixed(2);
  };

  return (
    <div className="space-y-8" data-testid="subscriptions-page">
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Subscription"
        message="Are you sure you want to delete this subscription? This cannot be undone."
        onConfirm={deleteSubscription}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="subscriptions-title">Subscriptions</h1>
          <p className="text-muted-foreground">Manage your recurring subscriptions</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingSub(null); setFormData({ name: '', amount: '', renewal_date: '', category: 'streaming', billing_cycle: 'monthly', usage_frequency: 'regular' }); } }}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="bg-secondary text-black hover:bg-secondary/90 rounded-none font-semibold" data-testid="add-subscription-button">
              <Plus size={20} weight="bold" className="mr-2" />Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface border border-border rounded-none" data-testid="add-subscription-dialog">
            <DialogHeader>
              <DialogTitle className="text-white">{editingSub ? 'Edit Subscription' : 'Add New Subscription'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Service Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-muted border-border rounded-none text-white mt-1" required />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Amount (₹)</Label>
                <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="bg-muted border-border rounded-none text-white mt-1" required />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Renewal Date</Label>
                <Input type="date" value={formData.renewal_date} onChange={(e) => setFormData({...formData, renewal_date: e.target.value})} className="bg-muted border-border rounded-none text-white mt-1" required />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="bg-muted border-border rounded-none text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface border-border rounded-none">
                    <SelectItem value="streaming">Streaming</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="cloud">Cloud Storage</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="news">News & Media</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Billing Cycle</Label>
                <Select value={formData.billing_cycle} onValueChange={(value) => setFormData({...formData, billing_cycle: value})}>
                  <SelectTrigger className="bg-muted border-border rounded-none text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface border-border rounded-none">
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Usage Frequency</Label>
                <Select value={formData.usage_frequency} onValueChange={(value) => setFormData({...formData, usage_frequency: value})}>
                  <SelectTrigger className="bg-muted border-border rounded-none text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface border-border rounded-none">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="occasional">Occasional</SelectItem>
                    <SelectItem value="rarely">Rarely</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-secondary text-black hover:bg-secondary/90 rounded-none font-semibold">
                {editingSub ? 'Update Subscription' : 'Add Subscription'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-surface border border-secondary/30 p-6 rounded-none" data-testid="total-cost-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Total Monthly Cost</p>
            <p className="text-4xl font-bold text-secondary">₹{getTotalMonthlyCost()}</p>
          </div>
          <ArrowClockwise size={40} className="text-secondary" weight="duotone" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.length === 0 ? (
          <Card className="bg-surface border border-border p-8 rounded-none text-center col-span-full" data-testid="no-subscriptions-message">
            <p className="text-muted-foreground">No subscriptions yet. Add your first subscription to track costs.</p>
          </Card>
        ) : (
          subscriptions.map((sub) => (
            <Card key={sub.id} className="bg-surface border border-border p-5 rounded-none hover:border-secondary/50 transition-colors duration-200" data-testid={`subscription-card-${sub.id}`}>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-lg">{sub.name}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{sub.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(sub)} className="text-muted-foreground hover:text-secondary transition-colors duration-200">
                      <PencilSimple size={18} />
                    </button>
                    <button onClick={() => confirmDelete(sub.id)} className="text-muted-foreground hover:text-destructive transition-colors duration-200" data-testid={`subscription-delete-${sub.id}`}>
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Amount</span>
                    <span className="text-xl font-bold text-secondary">₹{sub.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Billing</span>
                    <span className="text-sm text-white">{sub.billing_cycle}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Usage</span>
                    <span className="text-sm text-white">{sub.usage_frequency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Next Renewal</span>
                    <span className="text-sm text-white">{format(new Date(sub.renewal_date), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}