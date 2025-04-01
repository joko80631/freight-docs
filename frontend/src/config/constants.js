export const DOCUMENT_TYPES = {
  BILL_OF_LADING: 'bill_of_lading',
  INVOICE: 'invoice',
  PACKING_LIST: 'packing_list',
  CUSTOMS_DECLARATION: 'customs_declaration'
};

export const DOCUMENT_TYPE_LABELS = {
  [DOCUMENT_TYPES.BILL_OF_LADING]: 'Bill of Lading',
  [DOCUMENT_TYPES.INVOICE]: 'Invoice',
  [DOCUMENT_TYPES.PACKING_LIST]: 'Packing List',
  [DOCUMENT_TYPES.CUSTOMS_DECLARATION]: 'Customs Declaration'
};

export const DOCUMENT_STATUSES = {
  PENDING: 'pending',
  CLASSIFIED: 'classified',
  REJECTED: 'rejected'
};

export const DOCUMENT_STATUS_LABELS = {
  [DOCUMENT_STATUSES.PENDING]: 'Pending',
  [DOCUMENT_STATUSES.CLASSIFIED]: 'Classified',
  [DOCUMENT_STATUSES.REJECTED]: 'Rejected'
};

export const LOAD_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const LOAD_STATUS_LABELS = {
  [LOAD_STATUSES.ACTIVE]: 'Active',
  [LOAD_STATUSES.COMPLETED]: 'Completed',
  [LOAD_STATUSES.CANCELLED]: 'Cancelled'
};

export const ITEMS_PER_PAGE = {
  DOCUMENTS: 20,
  LOADS: 10
}; 