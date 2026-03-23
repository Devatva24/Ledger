import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Bills from './pages/Bills';
import Subscriptions from './pages/Subscriptions';
import Tasks from './pages/Tasks';
import Insights from './pages/Insights';
import { Toaster } from 'sonner';
import {
  House,
  Receipt,
  Calendar,
  CheckSquare,
  Lightbulb
} from '@phosphor-icons/react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

function Navigation() {
  const location = useLocation();
 
  const navItems = [
  { path: '/', icon: House, label: 'Dashboard' },
  { path: '/bills', icon: Receipt, label: 'Bills' },
  { path: '/subscriptions', icon: Calendar, label: 'Subscriptions' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/insights', icon: Lightbulb, label: 'AI Insights' },
];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10" style={{ background: 'rgba(5, 5, 5, 0.8)', backdropFilter: 'blur(24px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" data-testid="status-indicator"></div>
            <h1 className="text-xl font-bold text-white" data-testid="app-title">LIFE ADMIN</h1>
          </div>
          
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  className={`flex items-center gap-2 px-4 py-2 transition-colors duration-200 hover:text-white ${
                    isActive 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-muted-foreground hover:bg-white/5'
                  }`}
                >
                  <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                  <span className="hidden md:inline text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background">
      <BrowserRouter>
        <Navigation />
        <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;