// src/app/payments/[id]/page.js
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Button from '../../../../components/UI/Button';
import StatusBadge from '../../../../components/Shared/StatusBadge';
import DeleteButton from '../../../../components/Shared/DeleteButton';

export default function PaymentDetailPage({ params }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPayment();
  }, [params.id]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Payment')
        .select(`
          *,
          Rental(
            *,
            Customer(*)
          ),
          User(username)
        `)
        .eq('payment_id', params.id)
        .single();

      if (error) throw error;
      setPayment(data);
    } catch (error) {
      console.error('Error fetching payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      // First, check if we need to revert rental status
      if (payment.Rental.status === 'Completed') {
        await supabase
          .from('Rental')
          .update({ status: 'Active' })
          .eq('rentalID', payment.rental_id);
      }

      // Then delete the payment
      const { error } = await supabase
        .from('Payment')
        .delete()
        .eq('payment_id', params.id);

      if (error) throw error;
      
      router.push('/payments');
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!payment) {
    return <div className="text-center py-8">Payment not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment Details</h1>
        <Button onClick={() => router.push('/payments')}>Back to List</Button>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-medium mb-2">Payment Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Payment ID:</span> {payment.payment_id}</p>
              <p><span className="font-medium">Date:</span> {new Date(payment.payment_date).toLocaleDateString()}</p>
              <p><span className="font-medium">Method:</span> {payment.payment_method}</p>
              <p><span className="font-medium">Processed By:</span> {payment.User.username}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-2">Amounts</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Deposit Payment:</span> ${payment.deposit_payment}</p>
              <p><span className="font-medium">Rental Payment:</span> ${payment.rental_payment}</p>
              <p className="font-medium border-t pt-2">
                <span>Total Payment: </span>
                ${payment.deposit_payment + payment.rental_payment}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Related Rental</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Rental ID:</span> {payment.Rental.rentalID}</p>
            <p><span className="font-medium">Customer:</span> {payment.Rental.Customer.full_name}</p>
            <p><span className="font-medium">Status:</span> <StatusBadge status={payment.Rental.status} /></p>
            <p><span className="font-medium">Period:</span> {new Date(payment.Rental.start_date).toLocaleDateString()} - {new Date(payment.Rental.end_date).toLocaleDateString()}</p>
            <p><span className="font-medium">Total Rental Amount:</span> ${payment.Rental.total_amount}</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <DeleteButton
            onDelete={handleDelete}
            confirmMessage="Are you sure you want to delete this payment? This will revert the related rental status if it was completed."
          />
        </div>
      </div>
    </div>
  );
}