// src/app/rentals/[id]/page.js
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Button from '../../../components/UI/Button';
import StatusBadge from '../../../components/Shared/StatusBadge';
import DeleteButton from '../../../components/Shared/DeleteButton';
import RentalForm from '../../../components/Rental/RentalForm';

export default function RentalDetailPage({ params }) {
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [processedByUser, setProcessedByUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchRental();
  }, [params.id]);

  const fetchRental = async () => {
    try {
      setLoading(true);
      // First fetch the rental with customer details
      const { data: rentalData, error: rentalError } = await supabase
        .from('Rental')
        .select(`
          *,
          Customer(*),
          RentalDetail(
            *,
            Equipment(
              *,
              EquipmentType(*)
            )
          )
        `)
        .eq('rentalID', params.id)
        .single();

      if (rentalError) throw rentalError;

      // Then fetch the user who processed the rental
      if (rentalData.processed_by) {
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('userID, username, full_name')
          .eq('userID', rentalData.processed_by)
          .single();

        if (!userError) {
          setProcessedByUser(userData);
        }
      }

      setRental(rentalData);
    } catch (error) {
      console.error('Error fetching rental:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... (keep other functions like handleUpdate, handleDelete, handleReturnEquipment the same)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!rental) {
    return <div className="text-center py-8">Rental not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {editMode ? 'Edit Rental' : `Rental #${rental.rentalID}`}
        </h1>
        <Button onClick={() => router.push('/rentals')}>Back to List</Button>
      </div>
      
      {editMode ? (
        <RentalForm
          initialData={rental}
          onSubmit={handleUpdate}
          onCancel={() => setEditMode(false)}
          isEdit
        />
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-medium mb-2">Customer Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Customer ID:</span> {rental.customerID}</p>
                <p><span className="font-medium">Name:</span> {rental.Customer?.full_name || 'N/A'}</p>
                <p><span className="font-medium">Email:</span> {rental.Customer?.email || 'N/A'}</p>
                <p><span className="font-medium">Phone:</span> {rental.Customer?.phone || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium mb-2">Rental Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Status:</span> <StatusBadge status={rental.status} /></p>
                <p><span className="font-medium">Start Date:</span> {new Date(rental.start_date).toLocaleDateString()}</p>
                <p><span className="font-medium">End Date:</span> {new Date(rental.end_date).toLocaleDateString()}</p>
                {rental.actual_return_date && (
                  <p><span className="font-medium">Actual Return:</span> {new Date(rental.actual_return_date).toLocaleDateString()}</p>
                )}
                <p><span className="font-medium">Total Amount:</span> ${rental.total_amount}</p>
                {rental.penalty_fee && (
                  <p><span className="font-medium">Penalty Fee:</span> ${rental.penalty_fee}</p>
                )}
                <p><span className="font-medium">Processed By:</span> {processedByUser ? `${processedByUser.full_name} (${processedByUser.username})` : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Equipment table remains the same */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Rented Equipment</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deposit</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rental.RentalDetail?.map((detail) => (
                    <tr key={`${detail.rental_id}-${detail.equipment_id}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {detail.Equipment?.EquipmentType?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {detail.Equipment?.serial_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {detail.time_quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${detail.Equipment?.EquipmentType?.rate || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${detail.subtotal}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${detail.required_deposit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex space-x-4">
            {rental.status === 'Active' && (
              <Button onClick={handleReturnEquipment}>
                Mark as Returned
              </Button>
            )}
            <Button onClick={() => setEditMode(true)}>
              Edit Rental
            </Button>
            <DeleteButton
              onDelete={handleDelete}
              confirmMessage="Are you sure you want to delete this rental? This will also delete all related rental details."
            />
          </div>
        </div>
      )}
    </div>
  );
}