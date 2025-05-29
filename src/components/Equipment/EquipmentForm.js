// src/components/Equipment/EquipmentForm.js
'use client';
import { useState, useEffect } from 'react';
import FormInput from '../Shared/FormInput';
import Button from '../UI/Button';

export default function EquipmentForm({ initialData, onSubmit, onCancel, isEdit = false }) {
  const [formData, setFormData] = useState(initialData || {
    typeID: '',
    serial_number: '',
    purchase_date: '',
    condition: 'Good',
    status: 'Available',
    notes: '',
  });
  const [types, setTypes] = useState([]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>
      <FormInput
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        type="textarea"
        className="mt-6"
      />
      <div className="mt-6 flex space-x-4">
        <Button type="submit">
          {isEdit ? 'Update Equipment' : 'Add Equipment'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}