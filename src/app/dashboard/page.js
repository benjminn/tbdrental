// src/app/dashboard/page.js
'use client';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Card from '../../components/UI/Card';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (!isClient || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null; // Redirect will happen automatically
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Main Dashboard" user={user} />
      
      <main className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user.full_name || user.username}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your camera rental business today
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardStatCard 
            title="Active Rentals"
            value="24"
            change="+3 from yesterday"
            icon={<RentalIcon />}
          />
          <DashboardStatCard 
            title="Available Equipment"
            value="42"
            change="5 currently being serviced"
            icon={<EquipmentIcon />}
          />
          <DashboardStatCard 
            title="Revenue Today"
            value="$1,240"
            change="12% from yesterday"
            icon={<RevenueIcon />}
          />
          <DashboardStatCard 
            title="New Customers"
            value="5"
            change="2 pending verification"
            icon={<CustomerIcon />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Recent Rentals</h2>
              <RecentRentalsTable />
            </div>
          </div>
          
          <div>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full btn-primary">Create New Rental</button>
                <button className="w-full btn-secondary">Add Equipment</button>
                <button className="w-full btn-outline">Process Payment</button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">System Alerts</h2>
              <AlertsList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Example component placeholders (you should create these as separate components)
function DashboardStatCard({ title, value, change, icon }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{change}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function RentalIcon() { return <svg>...</svg> }
function EquipmentIcon() { return <svg>...</svg> }
function RevenueIcon() { return <svg>...</svg> }
function CustomerIcon() { return <svg>...</svg> }
function RecentRentalsTable() { return <div>Table content...</div> }
function AlertsList() { return <div>Alerts content...</div> }