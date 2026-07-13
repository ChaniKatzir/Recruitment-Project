export class PublicComplaintFormData {
  // Contact Type
  contactType: string = '';
  
  // Contactor Details
  name: string = '';
  idNumber: string = '';
  email: string = '';
  phone: string = '';
  address: string = '';
  
  // Contact Details
  subject: string = '';
  description: string = '';
  hasEvidence: boolean = false;
  
  // Document Upload
  documents: File[] = [];
  
  // Form State
  isValid: boolean = false;
  errors: { [key: string]: string[] } = {};
  
  constructor(data?: Partial<PublicComplaintFormData>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
