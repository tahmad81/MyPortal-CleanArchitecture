export interface Property {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  type: 'Rent' | 'Sale';
  category: 'House' | 'Apartment' | 'Villa' | 'Land' | 'Commercial' | 'Other';
  price: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  areaUnit?: string;
  yearBuilt?: number;
  parking?: string;
  furnishingStatus?: string;
  contactNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  photos: PropertyPhoto[];
}

export interface PropertyPhoto {
  id: string;
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface PropertyPhotoRequest {
  fileName: string;
  imageData: number[]; // byte array as number array for JSON serialization
  contentType: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface CreatePropertyRequest {
  title: string;
  description: string;
  type: 'Rent' | 'Sale';
  category: 'House' | 'Apartment' | 'Villa' | 'Land' | 'Commercial' | 'Other';
  price: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  areaUnit?: string;
  yearBuilt?: number;
  parking?: string;
  furnishingStatus?: string;
  contactNumber?: string;
  photos?: PropertyPhotoRequest[];
}

export interface PropertyListResponse {
  success: boolean;
  message: string;
  data: Property[];
}

export interface PropertyResponse {
  success: boolean;
  message: string;
  data: Property;
}

