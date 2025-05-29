// src/app/customers/page.js
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import DataTable from '../../components/Shared/DataTable';
import Button from '../../components/UI/Button';
import { useRouter } from 'next/navigation';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('Customer').select('*');
      if (error) throw error;
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'customerID' },
    { header: 'Name', accessor: 'full_name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Status', accessor: 'status' },
    { header: 'Actions', accessor: 'actions' },
  ];

  const data = customers.map((customer) => ({
    ...customer,
    actions: (
      <div className="flex space-x-2">
        <Button
          size="sm"
          onClick={() => router.push(`/customers/${customer.customerID}`)}
        >
          View
        </Button>
      </div>
    ),
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <Button onClick={() => router.push('/customers/add')}>Add Customer</Button>
      </div>
      <DataTable columns={columns} data={data} loading={loading} />
    </div>
  );
}