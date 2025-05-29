// src/app/equipment/[id]/page.js
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Button from '../../../../components/UI/Button';

export default function EquipmentDetailPage({ params }) {
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEquipment();
  }, [params.id]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Equipment')
        .select('*, EquipmentType(*)')
        .eq('equipmentID', params.id)
        .single();

      if (error) throw error;
      setEquipment(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!equipment) {
    return <div className="text-center py-8">Equipment not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Equipment Details</h1>
        <Button onClick={() => router.push('/equipment')}>Back to List</Button>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium mb-2">Basic Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">ID:</span> {equipment.equipmentID}</p>
              <p><span className="font-medium">Type:</span> {equipment.EquipmentType.name}</p>
              <p><span className="font-medium">Serial Number:</span> {equipment.serial_number}</p>
              <p><span className="font-medium">Purchase Date:</span> {equipment.purchase_date ? new Date(equipment.purchase_date).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-2">Status</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Condition:</span> {equipment.condition}</p>
              <p><span className="font-medium">Status:</span> {equipment.status}</p>
              <p><span className="font-medium">Rate:</span> ${equipment.EquipmentType.rate} per day</p>
              <p><span className="font-medium">Deposit Amount:</span> ${equipment.EquipmentType.deposit_amount}</p>
            </div>
          </div>
        </div>
        
        {equipment.notes && (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-2">Notes</h2>
            <p className="text-gray-700">{equipment.notes}</p>
          </div>
        )}
        
        <div className="mt-6 flex space-x-4">
          <Button onClick={() => router.push(`/equipment/${equipment.equipmentID}/edit`)}>
            Edit
          </Button>
          <Button variant="danger">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}