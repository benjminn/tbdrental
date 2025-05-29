// src/components/Shared/StatusBadge.js
const statusColors = {
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-gray-100 text-gray-800',
  Available: 'bg-blue-100 text-blue-800',
  Rented: 'bg-yellow-100 text-yellow-800',
  Maintenance: 'bg-purple-100 text-purple-800',
  Completed: 'bg-green-100 text-green-800',
  Overdue: 'bg-red-100 text-red-800',
  Good: 'bg-green-100 text-green-800',
  Damaged: 'bg-yellow-100 text-yellow-800',
  Lost: 'bg-red-100 text-red-800',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}