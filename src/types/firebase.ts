// Firebase-specific type definitions
import { Timestamp } from 'firebase/firestore';

export interface UserDocument {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'manager' | 'staff' | 'customer';
    status: 'active' | 'inactive';
    profile: {
        avatar?: string;
        phone?: string;
        address?: string;
        department?: string;
        position?: string;
    };
    permissions: string[];
    lastLogin: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    orders: number;
    totalSpent?: number;
}

export interface ProductDocument {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    category: string;
    material: string;
    dimensions: string;
    warranty: string;
    rating: number;
    reviews: number;
    stock: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    description?: string;
    images: {
        primary: string;
        gallery: string[];
    };

    // Category-specific properties (using maps for flexibility)
    sofaProperties?: Record<string, any>;
    chairProperties?: Record<string, any>;
    tableProperties?: Record<string, any>;
    bedroomProperties?: Record<string, any>;
    curtainProperties?: Record<string, any>;

    seo: {
        slug: string;
        metaTitle?: string;
        metaDescription?: string;
    };

    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string;
}

export interface InvoiceDocument {
    id: string;
    invoiceNumber: string;
    invoiceDate: Timestamp;
    salespersonId: string;
    salespersonName: string;
    orderType: 'Ready' | 'Custom Order';
    deliveryDate?: Timestamp;

    companyDetails: {
        logo?: string;
        name: string;
        address: string;
        contactNumber: string;
        email: string;
        gstNumber: string;
    };

    customerDetails: {
        name: string;
        mobileNumber: string;
        email?: string;
        address: string;
        gstNumber?: string;
    };

    productCount: number;

    calculations: {
        subtotal: number;
        totalDiscount: number;
        gstAmount: number;
        transportCharges: number;
        grandTotal: number;
        amountInWords: string;
    };

    paymentDetails: {
        mode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
        status: 'Paid' | 'Partial' | 'Pending';
        advancePaid: number;
        balanceAmount: number;
        dueDate?: Timestamp;
    };

    pdfGenerated: boolean;
    whatsappSent: boolean;

    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string;
}

export interface InvoiceProductDocument {
    id: string;
    productId: string;
    name: string;
    category: 'Sofa' | 'Curtain' | 'Pillow' | 'Accessory';
    material: string;
    size: string;
    quantity: number;
    rate: number;
    discount: number;
    discountType: 'percentage' | 'amount';
    taxRate: number;
    rowTotal: number;
    createdAt: Timestamp;
}

export interface PaymentDocument {
    id: string;
    date: Timestamp;
    party: string;
    amount: number;
    mode: 'cash' | 'card' | 'bank_transfer' | 'upi' | 'cheque' | 'online';
    status: 'paid' | 'pending' | 'processing' | 'partial' | 'overdue';
    type: 'receivable' | 'payable';
    invoiceId?: string;
    dueDate?: Timestamp;
    notes?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string;
}

export interface InquiryDocument {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    interestArea: string;
    budget: number;
    timeline: string;
    message: string;
    status: 'new' | 'contacted' | 'quoted' | 'converted' | 'closed';
    assignedTo?: string;
    followUpDate?: Timestamp;
    notes?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface ImageMetadataDocument {
    id: string;
    githubUrl: string;
    filename: string;
    alt: string;
    category: 'product' | 'team' | 'showroom' | 'hero' | 'company';
    entityId?: string;
    dimensions: {
        width: number;
        height: number;
    };
    fileSize: number;
    uploadedAt: Timestamp;
    uploadedBy: string;
}