import { Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';

const STATUS_ICONS = {
  PENDING_REVIEW: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  NEEDS_CLARIFICATION: AlertCircle,
  EXPIRED: Calendar
};

const STATUS_COLORS = {
  PENDING_REVIEW: 'text-yellow-500',
  APPROVED: 'text-green-500',
  REJECTED: 'text-red-500',
  NEEDS_CLARIFICATION: 'text-blue-500',
  EXPIRED: 'text-gray-500'
};

export default function StatusHistory({ history }) {
  if (!history?.length) {
    return (
      <div className="text-center text-gray-500 py-4">
        No status history available
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((entry, index) => {
          const Icon = STATUS_ICONS[entry.status] || Clock;
          const color = STATUS_COLORS[entry.status] || 'text-gray-500';
          const isLast = index === history.length - 1;

          return (
            <li key={entry.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${color}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Status changed to{' '}
                        <span className="font-medium text-gray-900">
                          {entry.status.replace('_', ' ')}
                        </span>
                      </p>
                      {entry.comment && (
                        <p className="mt-1 text-sm text-gray-700">
                          {entry.comment}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      <time dateTime={entry.created_at}>
                        {new Date(entry.created_at).toLocaleString()}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 