// src/app/equipment/page.js
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import DataTable from '../../components/Shared/DataTable';
import Button from '../../components/UI/Button';
import { useRouter } from 'next/navigation';

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Equipment')
        .select(`
          equipmentID,
          serial_number,
          condition,
          status,
          notes,
          EquipmentType(name, rate)
        `);

      if (error) throw error;
      setEquipment(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'equipmentID' },
    { header: 'Serial Number', accessor: 'serial_number' },
    { header: 'Type', accessor: 'EquipmentType.name' },
    { header: 'Condition', accessor: 'condition' },
    { header: 'Status', accessor: 'status' },
    { header: 'Actions', accessor: 'actions' },
  ];

  const data = equipment.map((item) => ({
    ...item,
    actions: (
      <div className="flex space-x-2">
        <Button
          size="sm"
          onClick={() => router.push(`/equipment/${item.equipmentID}`)}
        >
          View
        </Button>
      </div>
    ),
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Equipment Management</h1>
        <Button onClick={() => router.push('/equipment/add')}>Add Equipment</Button>
      </div>
      <DataTable columns={columns} data={data} loading={loading} />
    </div>
  );
}