export type PatientType = {
  code?: string;
  gender?: "male" | "female" | "";
  birthDate?: Date;
  name?: string;
  additional?: string;
};

export type RecordingType = {
  startDate?: Date;
  administrationCode?: string;
  technicianCode?: string;
  equipmentCode?: string;
  additional?: string;
};

export type SignalType = {
  label: string;
  transducer: string;
  physicalDimension: string;
  physicalMinimum: number;
  physicalMaximum: number;
  digitalMinimum: number;
  digitalMaximum: number;
  prefiltering: string;
  samples: number;
  reserved: string;
};

export type EdfHeaderType = {
  version: string;
  patient: PatientType;
  recording: RecordingType;
  startDateTime: Date;
  reserved: string;
  nRecords: number;
  duration: number;
  signals: SignalType[];
};
