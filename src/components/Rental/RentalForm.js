// src/components/Rental/RentalForm.js
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import FormInput from '../Shared/FormInput';
import Button from '../UI/Button';
import StatusBadge from '../Shared/StatusBadge';
import Modal from '../UI/Modal';

export default function RentalForm({ initialData, onSubmit, onCancel, isEdit = false }) {
  // Form state
  const [formData, setFormData] = useState({
    customerID: '',
    start_date: '',
    end_date: '',
    status: 'Active',
    equipmentItems: [],
    notes: ''
  });

  // Data for dropdowns
  const [customers, setCustomers] = useState([]);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch customers
        const { data: customersData } = await supabase
          .from('Customer')
          .select('*')
          .eq('status', 'Active');
        
        // Fetch available equipment
        const { data: equipmentData } = await supabase
          .from('Equipment')
          .select('*, EquipmentType(*)')
          .eq('status', 'Available');
        
        setCustomers(customersData || []);
        setAvailableEquipment(equipmentData || []);

        // If editing, populate form with existing data
        if (isEdit && initialData) {
          setFormData({
            customerID: initialData.customerID,
            start_date: initialData.start_date.split('T')[0], // Format date for input
            end_date: initialData.end_date.split('T')[0],
            status: initialData.status,
            equipmentItems: initialData.RentalDetail.map(detail => ({
              equipment_id: detail.equipment_id,
              typeID: detail.Equipment.typeID,
              name: detail.Equipment.EquipmentType.name,
              rate: detail.Equipment.EquipmentType.rate,
              deposit_amount: detail.Equipment.EquipmentType.deposit_amount,
              time_quantity: detail.time_quantity,
              subtotal: detail.subtotal,
              required_deposit: detail.required_deposit,
              serial_number: detail.Equipment.serial_number
            })),
            notes: initialData.notes || ''
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEdit, initialData]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Calculate rental period in days
  const calculateRentalDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  };

  // Calculate totals
  const calculateTotals = () => {
    const rentalDays = calculateRentalDays();
    
    return formData.equipmentItems.reduce((totals, item) => {
      const days = item.time_quantity || rentalDays;
      const subtotal = item.rate * days;
      const deposit = item.deposit_amount * days;
      
      return {
        subtotal: totals.subtotal + subtotal,
        deposit: totals.deposit + deposit,
        total: totals.total + subtotal
      };
    }, { subtotal: 0, deposit: 0, total: 0 });
  };

  // Add equipment to rental
  const handleAddEquipment = (equipment) => {
    if (formData.equipmentItems.some(item => item.equipment_id === equipment.equipmentID)) {
      setError('This equipment is already added');
      return;
    }

    const rentalDays = calculateRentalDays();
    
    setFormData(prev => ({
      ...prev,
      equipmentItems: [
        ...prev.equipmentItems,
        {
          equipment_id: equipment.equipmentID,
          typeID: equipment.typeID,
          name: equipment.EquipmentType.name,
          rate: equipment.EquipmentType.rate,
          deposit_amount: equipment.EquipmentType.deposit_amount,
          time_quantity: rentalDays,
          serial_number: equipment.serial_number
        }
      ]
    }));

    setShowEquipmentModal(false);
  };

  // Remove equipment from rental
  const handleRemoveEquipment = (equipmentId) => {
    setFormData(prev => ({
      ...prev,
      equipmentItems: prev.equipmentItems.filter(item => item.equipment_id !== equipmentId)
    }));
  };

  // Update equipment rental duration
  const handleUpdateQuantity = (equipmentId, quantity) => {
    setFormData(prev => ({
      ...prev,
      equipmentItems: prev.equipmentItems.map(item => 
        item.equipment_id === equipmentId 
          ? { ...item, time_quantity: Math.max(1, parseInt(quantity) || 1 } 
          : item
      )
    }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.customerID) throw new Error('Please select a customer');
      if (!formData.start_date || !formData.end_date) throw new Error('Please select rental dates');
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        throw new Error('End date must be after start date');
      }
      if (formData.equipmentItems.length === 0) throw new Error('Please add at least one equipment');

      const totals = calculateTotals();
      const rentalData = {
        customerID: formData.customerID,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        total_amount: totals.total,
        notes: formData.notes
      };

      if (isEdit) {
        // Update existing rental
        const { error: updateError } = await supabase
          .from('Rental')
          .update(rentalData)
          .eq('rentalID', initialData.rentalID);

        if (updateError) throw updateError;

        // Update rental details
        await Promise.all(
          formData.equipmentItems.map(item => 
            supabase
              .from('RentalDetail')
              .upsert({
                rental_id: initialData.rentalID,
                equipment_id: item.equipment_id,
                time_quantity: item.time_quantity,
                subtotal: item.rate * item.time_quantity,
                required_deposit: item.deposit_amount * item.time_quantity
              })
              .eq('rental_id', initialData.rentalID)
              .eq('equipment_id', item.equipment_id)
          )
        );
      } else {
        // Create new rental
        const { data: newRental, error: insertError } = await supabase
          .from('Rental')
          .insert([rentalData])
          .select()
          .single();

        if (insertError) throw insertError;

        // Create rental details
        await supabase
          .from('RentalDetail')
          .insert(
            formData.equipmentItems.map(item => ({
              rental_id: newRental.rentalID,
              equipment_id: item.equipment_id,
              time_quantity: item.time_quantity,
              subtotal: item.rate * item.time_quantity,
              required_deposit: item.deposit_amount * item.time_quantity
            }))
          );

        // Update equipment status to "Rented"
        await supabase
          .from('Equipment')
          .update({ status: 'Rented' })
          .in('equipmentID', formData.equipmentItems.map(item => item.equipment_id));
      }

      onSubmit();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render equipment selection modal
  const renderEquipmentModal = () => (
    <Modal isOpen={showEquipmentModal} onClose={() => setShowEquipmentModal(false)}>
      <div className="p-4">
        <h3 className="text-lg font-medium mb-4">Select Equipment</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableEquipment.map(equipment => (
            <div 
              key={equipment.equipmentID} 
              className={`p-3 border rounded cursor-pointer ${selectedEquipment?.equipmentID === equipment.equipmentID ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}
              onClick={() => setSelectedEquipment(equipment)}
            >
              <div className="flex justify-between">
                <span className="font-medium">{equipment.EquipmentType.name}</span>
                <span className="text-gray-600">${equipment.EquipmentType.rate}/day</span>
              </div>
              <div className="text-sm text-gray-600">
                Serial: {equipment.serial_number} | Deposit: ${equipment.EquipmentType.deposit_amount}
              </div>
              {equipment.condition !== 'Good' && (
                <StatusBadge status={equipment.condition} className="mt-1" />
              )}
            </div>
          ))}
          {availableEquipment.length === 0 && (
            <p className="text-center text-gray-500 py-4">No available equipment</p>
          )}
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="secondary" onClick={() => setShowEquipmentModal(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => selectedEquipment && handleAddEquipment(selectedEquipment)}
            disabled={!selectedEquipment}
          >
            Add Equipment
          </Button>
        </div>
      </div>
    </Modal>
  );

  // Calculate rental summary
  const { subtotal, deposit, total } = calculateTotals();
  const rentalDays = calculateRentalDays();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Customer"
          name="customerID"
          value={formData.customerID}
          onChange={handleChange}
          type="select"
          required
          options={[
            { value: '', label: 'Select a customer' },
            ...customers.map(c => ({ 
              value: c.customerID, 
              label: `${c.full_name} (${c.phone})` 
            }))
          ]}
        />

        <FormInput
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          type="select"
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Overdue', label: 'Overdue' }
          ]}
        />

        <FormInput
          label="Start Date"
          name="start_date"
          type="date"
          value={formData.start_date}
          onChange={handleChange}
          required
          min={new Date().toISOString().split('T')[0]}
        />

        <FormInput
          label="End Date"
          name="end_date"
          type="date"
          value={formData.end_date}
          onChange={handleChange}
          required
          min={formData.start_date || new Date().toISOString().split('T')[0]}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Equipment</h3>
          <Button 
            type="button" 
            size="sm"
            onClick={() => setShowEquipmentModal(true)}
            disabled={availableEquipment.length === 0}
          >
            Add Equipment
          </Button>
        </div>

        {formData.equipmentItems.length > 0 ? (
          <div className="space-y-4">
            {formData.equipmentItems.map(item => (
              <div key={item.equipment_id} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">Serial: {item.serial_number}</p>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveEquipment(item.equipment_id)}
                  >
                    Remove
                  </Button>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="Daily Rate"
                    name={`rate-${item.equipment_id}`}
                    value={`$${item.rate}`}
                    disabled
                  />

                  <FormInput
                    label="Days"
                    name={`days-${item.equipment_id}`}
                    type="number"
                    min="1"
                    value={item.time_quantity}
                    onChange={(e) => handleUpdateQuantity(item.equipment_id, e.target.value)}
                  />

                  <FormInput
                    label="Subtotal"
                    name={`subtotal-${item.equipment_id}`}
                    value={`$${(item.rate * item.time_quantity).toFixed(2)}`}
                    disabled
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <p className="text-gray-500">No equipment added to this rental</p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-3">Rental Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Rental Period:</span>
            <span>{rentalDays} day{rentalDays !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between">
            <span>Equipment Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Deposit Required:</span>
            <span>${deposit.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 mt-2 font-medium flex justify-between">
            <span>Total Amount:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <FormInput
        label="Notes (Optional)"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        type="textarea"
        rows={3}
      />

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={formData.equipmentItems.length === 0}
        >
          {isEdit ? 'Update Rental' : 'Create Rental'}
        </Button>
      </div>

      {renderEquipmentModal()}
    </form>
  );
}