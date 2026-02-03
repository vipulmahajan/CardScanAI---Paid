export interface Contact {
  fullName: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  mobile: string;
  website: string;
  address: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  COMPRESSING = 'COMPRESSING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface AnalysisState {
  status: AppStatus;
  message: string;
  progress: number;
}