
import { Asset } from '../types/asset';

// Helper to generate dates
const getDateMinusDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

const getDatePlusDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Calculate status based on next test date
const calculateStatus = (nextTestDate: string): 'active' | 'neardue' | 'expired' => {
  const today = new Date();
  const testDate = new Date(nextTestDate);
  const daysDiff = Math.ceil((testDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 0) {
    return 'expired';
  } else if (daysDiff <= 30) {
    return 'neardue';
  } else {
    return 'active';
  }
};

// Mock assets
export const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Insulating Rubber Gloves',
    serialNumber: 'SG-GLV-001',
    classification: 'Class 00',
    issueDate: getDateMinusDays(180),
    lastTestDate: getDateMinusDays(150),
    nextTestDate: getDatePlusDays(30),
    status: calculateStatus(getDatePlusDays(30)),
    assignedTo: '1',
    documents: [
      {
        id: 'doc-1',
        name: 'Initial Certification',
        dateUploaded: getDateMinusDays(180),
        url: '#',
      },
      {
        id: 'doc-2',
        name: 'Last Test Report',
        dateUploaded: getDateMinusDays(150),
        url: '#',
      }
    ]
  },
  {
    id: '2',
    name: 'Voltage Detector',
    serialNumber: 'SG-VDT-002',
    classification: 'Detection Equipment',
    issueDate: getDateMinusDays(200),
    lastTestDate: getDateMinusDays(90),
    nextTestDate: getDatePlusDays(90),
    status: calculateStatus(getDatePlusDays(90)),
    assignedTo: '2',
    documents: [
      {
        id: 'doc-3',
        name: 'Calibration Certificate',
        dateUploaded: getDateMinusDays(90),
        url: '#',
      }
    ]
  },
  {
    id: '3',
    name: 'Insulating Blanket',
    serialNumber: 'SG-BLK-003',
    classification: 'Class 1',
    issueDate: getDateMinusDays(120),
    lastTestDate: getDateMinusDays(60),
    nextTestDate: getDatePlusDays(120),
    status: calculateStatus(getDatePlusDays(120)),
    assignedTo: '1',
    documents: [
      {
        id: 'doc-4',
        name: 'Test Report',
        dateUploaded: getDateMinusDays(60),
        url: '#',
      }
    ]
  },
  {
    id: '4',
    name: 'Arc Flash Kit',
    serialNumber: 'SG-AFK-004',
    classification: 'PPE',
    issueDate: getDateMinusDays(300),
    lastTestDate: getDateMinusDays(10),
    nextTestDate: getDatePlusDays(170),
    status: calculateStatus(getDatePlusDays(170)),
    assignedTo: '2',
    documents: [
      {
        id: 'doc-5',
        name: 'Inspection Report',
        dateUploaded: getDateMinusDays(10),
        url: '#',
      }
    ]
  },
  {
    id: '5',
    name: 'Insulated Hand Tools',
    serialNumber: 'SG-IHT-005',
    classification: '1000V Rated',
    issueDate: getDateMinusDays(250),
    lastTestDate: getDateMinusDays(190),
    nextTestDate: getDateMinusDays(10),
    status: calculateStatus(getDateMinusDays(10)),
    assignedTo: '1',
    documents: [
      {
        id: 'doc-6',
        name: 'Certificate of Conformance',
        dateUploaded: getDateMinusDays(250),
        url: '#',
      }
    ]
  },
  {
    id: '6',
    name: 'Rubber Insulating Sleeves',
    serialNumber: 'SG-RIS-006',
    classification: 'Class 1',
    issueDate: getDateMinusDays(170),
    lastTestDate: getDateMinusDays(30),
    nextTestDate: getDatePlusDays(150),
    status: calculateStatus(getDatePlusDays(150)),
    assignedTo: '2',
    documents: [
      {
        id: 'doc-7',
        name: 'Test Certificate',
        dateUploaded: getDateMinusDays(30),
        url: '#',
      }
    ]
  },
  {
    id: '7',
    name: 'Face Shield',
    serialNumber: 'SG-FSH-007',
    classification: 'Arc Flash Protection',
    issueDate: getDateMinusDays(365),
    lastTestDate: getDateMinusDays(350),
    nextTestDate: getDateMinusDays(170),
    status: calculateStatus(getDateMinusDays(170)),
    assignedTo: '1',
    documents: [
      {
        id: 'doc-8',
        name: 'Inspection Report',
        dateUploaded: getDateMinusDays(350),
        url: '#',
      }
    ]
  },
  {
    id: '8',
    name: 'Insulating Mat',
    serialNumber: 'SG-MAT-008',
    classification: 'Class 3',
    issueDate: getDateMinusDays(140),
    lastTestDate: getDateMinusDays(130),
    nextTestDate: getDatePlusDays(50),
    status: calculateStatus(getDatePlusDays(50)),
    assignedTo: '2',
    documents: [
      {
        id: 'doc-9',
        name: 'Test Report',
        dateUploaded: getDateMinusDays(130),
        url: '#',
      }
    ]
  }
];

// Mock users data
export const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Tech User',
    email: 'tech@example.com',
    role: 'technician',
  }
];
