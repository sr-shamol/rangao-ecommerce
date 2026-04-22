import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function calculateDiscount(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getBanglaNumber(num: number): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .split('')
    .map((digit) => banglaDigits[parseInt(digit)])
    .join('');
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RNG-${timestamp}${random}`;
}

export function isValidPhone(phone: string): boolean {
  const bangladeshPhoneRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;
  return bangladeshPhoneRegex.test(phone.replace(/\s/g, ''));
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('880')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0')) {
    return `+88${cleaned}`;
  }
  if (cleaned.startsWith('1')) {
    return `+88${cleaned}`;
  }
  return phone;
}

export function getOrderStatusLabel(status: string): { label: string; color: string } {
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: 'অপেক্ষায়', color: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'নিশ্চিত', color: 'bg-blue-100 text-blue-800' },
    processing: { label: 'প্রস্তুত করা হচ্ছে', color: 'bg-purple-100 text-purple-800' },
    shipped: { label: 'পাঠানো হয়েছে', color: 'bg-orange-100 text-orange-800' },
    delivered: { label: 'পৌঁছে গেছে', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'বাতিল', color: 'bg-red-100 text-red-800' },
  };
  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
}