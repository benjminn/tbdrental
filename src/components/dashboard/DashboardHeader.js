// src/components/Dashboard/DashboardHeader.js
'use client';
import { useAuth } from '../../context/AuthContext';

export default function DashboardHeader({ title, user }) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">Welcome, {user.full_name || user.username}</span>
          <button 
            onClick={() => {/* logout logic */}}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}