// src/app/rentals/add/page.js
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'next/navigation';
import FormInput from '../../../components/Shared/FormInput';
import Button from '../../../components/UI/Button';
import { useAuth } from '../../../context/AuthContext';

export default function AddRentalPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    customerID: '',
    start_date: '',
    end_date: '',
    status: 'Active',
    equipmentItems: [],
  });
  const [customers, setCustomers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCustomers();
    fetchAvailableEquipment();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.from('Customer').select('*');
      if (error) throw error;
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchAvailableEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('Equipment')
        .select('*, EquipmentType(*)')
        .eq('status', 'Available');

      if (error) throw error;
      setAvailableEquipment(data);
    } catch (error) {
      console.error('Error fetching available equipment:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEquipment = (equipmentId) => {
    const selectedEquipment = availableEquipment.find(
      (item) => item.equipmentID === equipmentId
    );
    
    if (!selectedEquipment) return;

    setFormData((prev) => ({
      ...prev,
      equipmentItems: [
        ...prev.equipmentItems,
        {
          equipment_id: selectedEquipment.equipmentID,
          typeID: selectedEquipment.typeID,
          name: selectedEquipment.EquipmentType.name,
          rate: selectedEquipment.EquipmentType.rate,
          deposit_amount: selectedEquipment.EquipmentType.deposit_amount,
          time_quantity: 1,
        },
      ],
    }));

    setAvailableEquipment((prev) =>
      prev.filter((item) => item.equipmentID !== equipmentId)
    );
  };

  const handleRemoveEquipment = (equipmentId) => {
    const removedItem = formData.equipmentItems.find(
      (item) => item.equipment_id === equipmentId
    );
    
    if (!removedItem) return;

    setFormData((prev) => ({
      ...prev,
      equipmentItems: prev.equipmentItems.filter(
        (item) => item.equipment_id !== equipmentId
      ),
    }));

    setAvailableEquipment((prev) => [
      ...prev,
      {
        equipmentID: removedItem.equipment_id,
        typeID: removedItem.typeID,
        EquipmentType: {
          name: removedItem.name,
          rate: removedItem.rate,
          deposit_amount: removedItem.deposit_amount,
        },
      },
    ]);
  };

  const handleQuantityChange = (equipmentId, quantity) => {
    setFormData((prev) => ({
      ...prev,
      equipmentItems: prev.equipmentItems.map((item) =>
        item.equipment_id === equipmentId
          ? { ...item, time_quantity: parseInt(quantity) || 0 }
          : item
      ),
    }));
  };

  const calculateTotal = () => {
    return formData.equipmentItems.reduce(
      (total, item) => total + item.rate * item.time_quantity,
      0
    );
  };

  const calculateTotalDeposit = () => {
    return formData.equipmentItems.reduce(
      (total, item) => total + item.deposit_amount * item.time_quantity,
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First, create the rental record
      const { data: rentalData, error: rentalError } = await supabase
        .from('Rental')
        .insert([
          {
            customerID: formData.customerID,
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: formData.status,
            total_amount: calculateTotal(),
            processed_by: user.id,
          },
        ])
        .select('rentalID')
        .single();

      if (rentalError) throw rentalError;

      // Then, create rental details for each equipment item
      const rentalDetails = formData.equipmentItems.map((item) => ({
        rental_id: rentalData.rentalID,
        equipment_id: item.equipment_id,
        time_quantity: item.time_quantity,
        subtotal: item.rate * item.time_quantity,
        required_deposit: item.deposit_amount * item.time_quantity,
      }));

      const { error: detailsError } = await supabase
        .from('RentalDetail')
        .insert(rentalDetails);

      if (detailsError) throw detailsError;

      // Update equipment status to "Rented"
      const equipmentUpdates = formData.equipmentItems.map((item) =>
        supabase
          .from('Equipment')
          .update({ status: 'Rented' })
          .eq('equipmentID', item.equipment_id)
      );

      await Promise.all(equipmentUpdates);

      router.push(`/rentals/${rentalData.rentalID}`);
    } catch (error) {
      console.error('Error creating rental:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Rental</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Customer"
          name="customerID"
          value={formData.customerID}
          onChange={handleChange}
          type="select"
          options={customers.map((customer) => ({
            value: customer.customerID,
            label: customer.full_name,
          }))}
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Start Date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            type="date"
            required
          />
          <FormInput
            label="End Date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            type="date"
            required
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Add Equipment</h2>
          <FormInput
            name="equipment"
            type="select"
            options={availableEquipment.map((item) => ({
              value: item.equipmentID,
              label: `${item.EquipmentType.name} (${item.serial_number})`,
            }))}
            onChange={(e) => handleAddEquipment(parseInt(e.target.value))}
            disabled={availableEquipment.length === 0}
          />
          {availableEquipment.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">No available equipment to add</p>
          )}
        </div>

        {formData.equipmentItems.length > 0 && (
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Selected Equipment</h3>
            <div className="space-y-4">
              {formData.equipmentItems.map((item) => (
                <div key={item.equipment_id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Rate: ${item.rate} per day
                      </p>
                      <p className="text-sm text-gray-600">
                        Deposit: ${item.deposit_amount} per day
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => handleRemoveEquipment(item.equipment_id)}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="mt-2">
                    <FormInput
                      label="Days"
                      name={`quantity-${item.equipment_id}`}
                      value={item.time_quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.equipment_id, e.target.value)
                      }
                      type="number"
                      min="1"
                      className="w-20"
                    />
                    <div className="mt-1 text-sm">
                      <p>Subtotal: ${item.rate * item.time_quantity}</p>
                      <p>Required Deposit: ${item.deposit_amount * item.time_quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="font-medium">
                Total Rental Amount: ${calculateTotal()}
              </p>
              <p className="font-medium">
                Total Required Deposit: ${calculateTotalDeposit()}
              </p>
            </div>
          </div>
        )}

        <FormInput
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          type="select"
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Overdue', label: 'Overdue' },
          ]}
        />

        <div className="flex space-x-4">
          <Button type="submit" loading={loading} disabled={formData.equipmentItems.length === 0}>
            Create Rental
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/rentals')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}