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

const emptyForm = { name: '', amount: '', due_date: '', category: 'utilities', recurring: false };

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('due_date');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchBills(); }, []);

  const fetchBills = async () => {
    try {
      const response = await axios.get(`${API}/bills`);
      setBills(response.data);
    } catch (error) {
      toast.error('Failed to load bills');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBill) {
        await axios.put(`${API}/bills/${editingBill.id}`, {
          ...formData, amount: parseFloat(formData.amount)
        });
        toast.success('Bill updated successfully');
      } else {
        await axios.post(`${API}/bills`, {
          ...formData, amount: parseFloat(formData.amount)
        });
        toast.success('Bill added successfully');
      }
      setOpen(false);
      setEditingBill(null);
      setFormData(emptyForm);
      fetchBills();
    } catch (error) {
      toast.error(editingBill ? 'Failed to update bill' : 'Failed to add bill');
    }
  };

  const openEdit = (bill) => {
    setEditingBill(bill);
    setFormData({
      name: bill.name,
      amount: bill.amount,
      due_date: bill.due_date.split('T')[0],
      category: bill.category,
      recurring: bill.recurring || false,
    });
    setOpen(true);
  };

  const openAdd = () => {
    setEditingBill(null);
    setFormData(emptyForm);
    setOpen(true);
  };

  const togglePaid = async (bill) => {
    try {
      await axios.put(`${API}/bills/${bill.id}`, { paid: !bill.paid });
      toast.success(bill.paid ? 'Marked as unpaid' : 'Marked as paid');
      fetchBills();
    } catch (error) {
      toast.error('Failed to update bill');
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const deleteBill = async () => {
    try {
      await axios.delete(`${API}/bills/${deletingId}`);
      toast.success('Bill deleted');
      fetchBills();
    } catch (error) {
      toast.error('Failed to delete bill');
    }
  };

  const filtered = bills
    .filter(b => {
      if (filter === 'paid') return b.paid;
      if (filter === 'unpaid') return !b.paid;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'due_date') return new Date(a.due_date) - new Date(b.due_date);
      if (sort === 'amount_asc') return a.amount - b.amount;
      if (sort === 'amount_desc') return b.amount - a.amount;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="space-y-8" data-testid="bills-page">
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Bill"
        message="Are you sure you want to delete this bill? This cannot be undone."
        onConfirm={deleteBill}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Bills</h1>
          <p className="text-muted-foreground">Track and manage your bills</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingBill(null); setFormData(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="bg-primary text-black hover:bg-primary/90 rounded-none font-semibold">
              <Plus size={20} weight="bold" className="mr-2" />Add Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface border border-border rounded-none">
            <DialogHeader>
              <DialogTitle className="text-white">{editingBill ? 'Edit Bill' : 'Add New Bill'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Bill Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-muted border-border rounded-none text-white mt-1" required />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Amount (₹)</Label>
                <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="bg-muted border-border rounded-none text-white mt-1" required />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Due Date</Label>
                <Input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} className="bg-muted border-border rounded-none text-white mt-1" required />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger className="bg-muted border-border rounded-none text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface border-border rounded-none">
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90 rounded-none font-semibold">
                {editingBill ? 'Update Bill' : 'Add Bill'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Filter</Label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="bg-muted border-border rounded-none text-white mt-1 w-36"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-surface border-border rounded-none">
              <SelectItem value="all">All Bills</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Sort By</Label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="bg-muted border-border rounded-none text-white mt-1 w-44"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-surface border-border rounded-none">
              <SelectItem value="due_date">Due Date</SelectItem>
              <SelectItem value="amount_desc">Amount (High to Low)</SelectItem>
              <SelectItem value="amount_asc">Amount (Low to High)</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.length === 0 ? (
          <Card className="bg-surface border border-border p-8 rounded-none text-center">
            <p className="text-muted-foreground">No bills found.</p>
          </Card>
        ) : (
          filtered.map((bill) => (
            <Card key={bill.id} className={`bg-surface border p-4 rounded-none hover:border-primary/30 transition-colors duration-200 ${bill.paid ? 'border-border opacity-60' : 'border-border'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <button onClick={() => togglePaid(bill)} className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    {bill.paid ? <CheckCircle size={24} weight="fill" className="text-secondary" /> : <Circle size={24} />}
                  </button>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${bill.paid ? 'line-through text-muted-foreground' : 'text-white'}`}>{bill.name}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{bill.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className={`text-xl font-bold ${bill.paid ? 'text-muted-foreground' : 'text-primary'}`}>₹{bill.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Due: {format(new Date(bill.due_date), 'MMM dd, yyyy')}</p>
                  </div>
                  <button onClick={() => openEdit(bill)} className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    <PencilSimple size={20} />
                  </button>
                  <button onClick={() => confirmDelete(bill.id)} className="text-muted-foreground hover:text-destructive transition-colors duration-200">
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