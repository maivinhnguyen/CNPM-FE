export interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  ownerId: string;
  ownerName: string;
  ownerStudentId?: string;
  registeredAt: string;
  isActive: boolean;
}

export interface VehicleCreateData {
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
}
