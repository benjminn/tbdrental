// src/app/rentals/page.js
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import DataTable from '../../components/Shared/DataTable';
import Button from '../../components/UI/Button';
import { useRouter } from 'next/navigation';
import StatusBadge from '../../components/Shared/StatusBadge.js';

export default function RentalsPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Rental')
        .select(`
          rentalID,
          start_date,
          end_date,
          status,
          total_amount,
          Customer(full_name),
          User(username)
        `);

      if (error) throw error;
      setRentals(data);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'rentalID' },
    { header: 'Customer', accessor: 'Customer.full_name' },
    { header: 'Start Date', accessor: 'start_date' },
    { header: 'End Date', accessor: 'end_date' },
    { header: 'Total Amount', accessor: 'total_amount' },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (value) => <StatusBadge status={value} />
    },
    { header: 'Processed By', accessor: 'User.username' },
    { header: 'Actions', accessor: 'actions' },
  ];

  const data = rentals.map((rental) => ({
    ...rental,
    customerID: rental.customerID,
    start_date: new Date(rental.start_date).toLocaleDateString(),
    end_date: new Date(rental.end_date).toLocaleDateString(),
    total_amount: `$${rental.total_amount}`,
    actions: (
      <div className="flex space-x-2">
        <Button
          size="sm"
          onClick={() => router.push(`/rentals/${rental.rentalID}`)}
        >
          View
        </Button>
      </div>
    ),
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rental Management</h1>
        <Button onClick={() => router.push('/rentals/add')}>Create Rental</Button>
      </div>
      <DataTable columns={columns} data={data} loading={loading} />
    </div>
  );
}