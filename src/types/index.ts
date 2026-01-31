export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'pain' | 'viennoiserie' | 'gâteau' | 'pâtisserie' | 'autre';
  imageUrl?: string;
  available: boolean;
  createdAt: any;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  deliveryDate?: string;
  isPhoneOrder?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  orderId?: string;
  type: 'order' | 'event';
}

export interface Vacation {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  schedule?: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export type UserRole = 'customer' | 'admin';
