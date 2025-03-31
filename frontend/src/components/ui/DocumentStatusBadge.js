import { Tooltip } from '@headlessui/react';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';

const STATUS_CONFIG = {
  PENDING_REVIEW: {
    label: 'Pending Review',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Document has been uploaded and is awaiting review'
  },
  APPROVED: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Document has been verified and accepted'
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Document has issues and requires replacement'
  },
  NEEDS_CLARIFICATION: {
    label: 'Needs Clarification',
    color: 'bg-blue-100 text-blue-800',
    icon: AlertCircle,
    description: 'Document requires additional information'
  },
  EXPIRED: {
    label: 'Expired',
    color: 'bg-gray-100 text-gray-800',
    icon: Calendar,
    description: 'Document is no longer valid'
  }
};

export default function DocumentStatusBadge({ status, dueDate, className = '' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING_REVIEW;
  const Icon = config.icon;

  const getDueDateStatus = () => {
    if (!dueDate) return null;
    
    const now = new Date();
    const due = new Date(dueDate);
    const hoursUntilDue = (due - now) / (1000 * 60 * 60);
    
    if (hoursUntilDue < 0) return 'overdue';
    if (hoursUntilDue < 48) return 'due-soon';
    return 'on-track';
  };

  const dueDateStatus = getDueDateStatus();
  const dueDateColor = dueDateStatus === 'overdue' 
    ? 'text-red-500' 
    : dueDateStatus === 'due-soon'
    ? 'text-yellow-500'
    : 'text-green-500';

  return (
    <Tooltip className="relative">
      <Tooltip.Button className="focus:outline-none">
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}>
          <Icon className="h-3.5 w-3.5 mr-1" />
          {config.label}
          {dueDate && (
            <span className={`ml-1 ${dueDateColor}`}>
              • {new Date(dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </Tooltip.Button>
      <Tooltip.Panel className="absolute z-10 w-64 p-2 mt-2 bg-white rounded-lg shadow-lg">
        <div className="text-sm">
          <p className="font-medium">{config.label}</p>
          <p className="text-gray-600 mt-1">{config.description}</p>
          {dueDate && (
            <p className={`mt-2 ${dueDateColor}`}>
              Due: {new Date(dueDate).toLocaleString()}
            </p>
          )}
        </div>
      </Tooltip.Panel>
    </Tooltip>
  );
} 