// src/app/customers/add/page.js
'use client';
import { useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'next/navigation';
import FormInput from '../../../components/Shared/FormInput';
import Button from '../../../components/UI/Button';

export default function AddCustomerPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    identity_number: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('Customer').insert([{
        ...formData,
        registration_date: new Date().toISOString(),
      }]);
      if (error) throw error;
      router.push('/customers');
    } catch (error) {
      console.error('Error adding customer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Customer</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Full Name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Identity Number"
          name="identity_number"
          value={formData.identity_number}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          type="email"
          required
        />
        <FormInput
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          type="textarea"
          required
        />
        <FormInput
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          type="select"
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
          ]}
        />
        <div className="flex space-x-4">
          <Button type="submit" loading={loading}>
            Save Customer
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/customers')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}