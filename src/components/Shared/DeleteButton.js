// src/components/Shared/DeleteButton.js
'use client';
import { useState } from 'react';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

export default function DeleteButton({ onDelete, confirmMessage = 'Are you sure you want to delete this item?' }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    onDelete();
    setIsOpen(false);
  };

  return (
    <>
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        Delete
      </Button>
      
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
          <p className="mb-6">{confirmMessage}</p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}