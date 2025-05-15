
export type AssetStatus = 'active' | 'neardue' | 'expired';

export interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  classification: string;
  issueDate: string;
  lastTestDate: string;
  nextTestDate: string;
  status: AssetStatus;
  assignedTo: string;
  documents: Document[];
}

export interface Document {
  id: string;
  name: string;
  dateUploaded: string;
  url: string;
}
