'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import Card from '../components/UI/Card';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login'); // Pastikan path ini sesuai
    } else if (!loading) {
      setIsCheckingAuth(false);
    }
  }, [user, loading, router]);

  if (loading || isCheckingAuth) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Equipment"
          description="Manage camera equipment"
          link="/equipment"
          linkText="View Equipment"
        />
        <Card
          title="Customers"
          description="Manage customer data"
          link="/customers"
          linkText="View Customers"
        />
        <Card
          title="Rentals"
          description="Manage rental invoices"
          link="/rentals"
          linkText="View Rentals"
        />
        <Card
          title="Payments"
          description="Manage payment records"
          link="/payments"
          linkText="View Payments"
        />
      </div>
    </div>
  );
}