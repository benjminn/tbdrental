// src/app/payments/page.js
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import DataTable from '../../components/Shared/DataTable';
import Button from '../../components/UI/Button';
import { useRouter } from 'next/navigation';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Payment')
        .select(`
          payment_id,
          deposit_payment,
          rental_payment,
          payment_date,
          payment_method,
          Rental(rentalID, Customer(full_name)),
          User(username)
        `);

      if (error) throw error;
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'payment_id' },
    { header: 'Rental', accessor: 'Rental.rentalID' },
    { header: 'Customer', accessor: 'Rental.Customer.full_name' },
    { header: 'Deposit Payment', accessor: 'deposit_payment' },
    { header: 'Rental Payment', accessor: 'rental_payment' },
    { header: 'Total', accessor: 'total' },
    { header: 'Payment Date', accessor: 'payment_date' },
    { header: 'Method', accessor: 'payment_method' },
    { header: 'Processed By', accessor: 'User.username' },
    { header: 'Actions', accessor: 'actions' },
  ];

  const data = payments.map((payment) => ({
    ...payment,
    deposit_payment: `$${payment.deposit_payment}`,
    rental_payment: `$${payment.rental_payment}`,
    total: `$${payment.deposit_payment + payment.rental_payment}`,
    payment_date: new Date(payment.payment_date).toLocaleDateString(),
    actions: (
      <div className="flex space-x-2">
        <Button
          size="sm"
          onClick={() => router.push(`/payments/${payment.payment_id}`)}
        >
          View
        </Button>
      </div>
    ),
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <Button onClick={() => router.push('/payments/add')}>Add Payment</Button>
      </div>
      <DataTable columns={columns} data={data} loading={loading} />
    </div>
  );
}