// src/app/payments/add/page.js
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import FormInput from '../../../components/Shared/FormInput';
import Button from '../../../components/UI/Button';

export default function AddPaymentPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    rental_id: '',
    deposit_payment: 0,
    rental_payment: 0,
    payment_method: 'Cash',
  });
  const [rentals, setRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchActiveRentals();
  }, []);

  const fetchActiveRentals = async () => {
    try {
      const { data, error } = await supabase
        .from('Rental')
        .select('*, Customer(full_name)')
        .eq('status', 'Active');

      if (error) throw error;
      setRentals(data);
    } catch (error) {
      console.error('Error fetching active rentals:', error);
    }
  };

  const handleRentalChange = async (rentalId) => {
    setFormData((prev) => ({ ...prev, rental_id: rentalId }));
    
    if (!rentalId) {
      setSelectedRental(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('Rental')
        .select('*, RentalDetail(subtotal, required_deposit)')
        .eq('rentalID', rentalId)
        .single();

      if (error) throw error;

      setSelectedRental(data);

      const totalRental = data.RentalDetail.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );
      const totalDeposit = data.RentalDetail.reduce(
        (sum, item) => sum + item.required_deposit,
        0
      );

      setFormData((prev) => ({
        ...prev,
        rental_payment: totalRental,
        deposit_payment: totalDeposit,
      }));
    } catch (error) {
      console.error('Error fetching rental details:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('Payment').insert([
        {
          rental_id: formData.rental_id,
          deposit_payment: parseFloat(formData.deposit_payment),
          rental_payment: parseFloat(formData.rental_payment),
          payment_date: new Date().toISOString(),
          payment_method: formData.payment_method,
          processed_by: user.id,
        },
      ]);

      if (error) throw error;

      await supabase
        .from('Rental')
        .update({ status: 'Completed' })
        .eq('rentalID', formData.rental_id);

      const { data: rentalDetails } = await supabase
        .from('RentalDetail')
        .select('equipment_id')
        .eq('rental_id', formData.rental_id);

      if (rentalDetails && rentalDetails.length > 0) {
        const equipmentUpdates = rentalDetails.map((item) =>
          supabase
            .from('Equipment')
            .update({ status: 'Available' })
            .eq('equipmentID', item.equipment_id)
        );

        await Promise.all(equipmentUpdates);
      }

      router.push('/payments');
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Payment</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Rental"
          name="rental_id"
          value={formData.rental_id}
          onChange={(e) => handleRentalChange(e.target.value)}
          type="select"
          options={rentals.map((rental) => ({
            value: rental.rentalID,
            label: `#${rental.rentalID} - ${rental.Customer.full_name}`,
          }))}
          required
        />

        {selectedRental && (
          <>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Rental Details</h3>
              <p>
                <span className="font-medium">Start Date:</span>{' '}
                {new Date(selectedRental.start_date).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">End Date:</span>{' '}
                {new Date(selectedRental.end_date).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Total Rental Amount:</span> $
                {selectedRental.total_amount}
              </p>
              <p>
                <span className="font-medium">Required Deposit:</span> $
                {selectedRental.RentalDetail.reduce(
                  (sum, item) => sum + item.required_deposit,
                  0
                )}
              </p>
            </div>

            <FormInput
              label="Deposit Payment"
              name="deposit_payment"
              value={formData.deposit_payment}
              onChange={handleChange}
              type="number"
              min="0"
              required
            />

            <FormInput
              label="Rental Payment"
              name="rental_payment"
              value={formData.rental_payment}
              onChange={handleChange}
              type="number"
              min="0"
              required
            />

            <FormInput
              label="Payment Method"
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              type="select"
              options={[
                { value: 'Cash', label: 'Cash' },
                { value: 'Transfer', label: 'Bank Transfer' },
                { value: 'QRIS', label: 'QRIS' },
                { value: 'Card', label: 'Credit/Debit Card' },
              ]}
              required
            />
          </>
        )}

        <div className="flex space-x-4">
          <Button type="submit" loading={loading} disabled={!selectedRental}>
            Process Payment
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/payments')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}