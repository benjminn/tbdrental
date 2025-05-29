// src/app/equipment/add/page.js
'use client';
import { useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'next/navigation';
import FormInput from '../../../components/Shared/FormInput';
import Button from '../../../components/UI/Button';

export default function AddEquipmentPage() {
  const [formData, setFormData] = useState({
    typeID: '',
    serial_number: '',
    purchase_date: '',
    condition: 'Good',
    status: 'Available',
    notes: '',
  });
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchEquipmentTypes();
  }, []);

  const fetchEquipmentTypes = async () => {
    try {
      const { data, error } = await supabase.from('EquipmentType').select('*');
      if (error) throw error;
      setTypes(data);
    } catch (error) {
      console.error('Error fetching equipment types:', error);
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
      const { error } = await supabase.from('Equipment').insert([formData]);
      if (error) throw error;
      router.push('/equipment');
    } catch (error) {
      console.error('Error adding equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Equipment</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Equipment Type"
          name="typeID"
          value={formData.typeID}
          onChange={handleChange}
          type="select"
          options={types.map((type) => ({
            value: type.typeID,
            label: type.name,
          }))}
          required
        />
        <FormInput
          label="Serial Number"
          name="serial_number"
          value={formData.serial_number}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Purchase Date"
          name="purchase_date"
          value={formData.purchase_date}
          onChange={handleChange}
          type="date"
        />
        <FormInput
          label="Condition"
          name="condition"
          value={formData.condition}
          onChange={handleChange}
          type="select"
          options={[
            { value: 'Good', label: 'Good' },
            { value: 'Damaged', label: 'Damaged' },
            { value: 'Lost', label: 'Lost' },
          ]}
        />
        <FormInput
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          type="select"
          options={[
            { value: 'Available', label: 'Available' },
            { value: 'Rented', label: 'Rented' },
            { value: 'Maintenance', label: 'Maintenance' },
          ]}
        />
        <FormInput
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          type="textarea"
        />
        <div className="flex space-x-4">
          <Button type="submit" loading={loading}>
            Save Equipment
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/equipment')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}