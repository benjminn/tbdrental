// src/components/Customer/CustomerForm.js
'use client';
import FormInput from '../Shared/FormInput';
import Button from '../UI/Button';

export default function CustomerForm({ initialData, onSubmit, onCancel, isEdit = false }) {
  const [formData, setFormData] = useState(initialData || {
    full_name: '',
    identity_number: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active',
  });

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
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          type="select"
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
          ]}
          className="md:col-span-2"
        />
      </div>
      <FormInput
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        type="textarea"
        className="mt-6"
        required
      />
      <div className="mt-6 flex space-x-4">
        <Button type="submit">
          {isEdit ? 'Update Customer' : 'Add Customer'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}