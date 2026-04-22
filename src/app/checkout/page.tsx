'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Phone, MapPin, Truck, CreditCard, MessageCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Input, TextArea, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart';
import { formatPrice, generateOrderId, isValidPhone } from '@/lib/utils';

const districts = [
  { value: 'dhaka', label: 'Dhaka (Inside)', deliveryCharge: 60 },
  { value: 'ctg', label: 'Chittagong', deliveryCharge: 120 },
  { value: 'sylhet', label: 'Sylhet', deliveryCharge: 120 },
  { value: 'rajshahi', label: 'Rajshahi', deliveryCharge: 120 },
  { value: 'khulna', label: 'Khulna', deliveryCharge: 120 },
  { value: 'barishal', label: 'Barishal', deliveryCharge: 120 },
  { value: 'rangpur', label: 'Rangpur', deliveryCharge: 120 },
  { value: 'mymensingh', label: 'Mymensingh', deliveryCharge: 120 },
  { value: 'other', label: 'Other Districts', deliveryCharge: 130 },
];

const paymentMethods = [
  { id: 'cod', name: 'Cash on Delivery', icon: '💵', description: 'Pay when you receive' },
  { id: 'bkash', name: 'bKash', icon: '📱', description: 'Mobile banking' },
  { id: 'nagad', name: 'Nagad', icon: '📱', description: 'Mobile banking' },
  { id: 'card', name: 'Card Payment', icon: '💳', description: 'SSLCommerz' },
];

const couriers = [
  { id: 'steadfast', name: 'Steadfast', description: 'Fast & reliable' },
  { id: 'redx', name: 'RedX', description: 'Express delivery' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getDiscount, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('dhaka');
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [selectedCourier, setSelectedCourier] = useState('steadfast');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    area: '',
  });

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const currentDistrict = districts.find(d => d.value === selectedDistrict);
  const deliveryCharge = currentDistrict?.deliveryCharge || 60;
  const total = subtotal - discount + deliveryCharge;

  const handleSendOTP = async () => {
    if (!isValidPhone(phone)) {
      alert('Please enter a valid Bangladesh phone number');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOtpSent(true);
    setIsLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOtpVerified(true);
    setStep(2);
    setIsLoading(false);
  };

  const handleSubmitOrder = async () => {
    if (!formData.name || !formData.address) {
      alert('Please fill in all required fields');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_phone: phone,
          shipping_address: `${formData.address}, ${formData.area}, ${currentDistrict?.label}`,
          payment_method: selectedPayment,
          items: items.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            variant: item.variant?.name,
          })),
          subtotal,
          delivery_charge: deliveryCharge,
          discount,
          total,
        }),
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        router.push(`/order/${data.order_id}`);
      } else {
        alert(data.error || 'Failed to place order');
      }
    } catch (err) {
      alert('Order failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-4">Add some items before checkout</p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-0">
        <section className="bg-primary text-white py-6">
          <div className="container-main">
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>
        </section>

        <section className="py-8">
          <div className="container-main">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-4">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                      step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step > s ? <Check size={16} /> : s}
                    </div>
                    <span className={`text-sm font-medium ${step >= s ? 'text-primary' : 'text-gray-500'}`}>
                      {s === 1 ? 'Verify' : s === 2 ? 'Details' : 'Payment'}
                    </span>
                    {s < 3 && <div className="w-8 h-px bg-gray-200" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2">
                {step === 1 && (
                  <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <Phone size={20} className="text-primary" />
                      Phone Verification
                    </h2>
                    
                    {!otpSent ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Phone Number
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+880 1XXX XXX XXX"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                          <Button onClick={handleSendOTP} isLoading={isLoading}>
                            Send OTP
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          OTP verification is required to prevent fake orders
                        </p>
                      </div>
                    ) : !otpVerified ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Enter OTP
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="XXXXXX"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            maxLength={6}
                          />
                          <Button onClick={handleVerifyOTP} isLoading={isLoading}>
                            Verify
                          </Button>
                        </div>
                        <button
                          onClick={() => setOtpSent(false)}
                          className="text-sm text-primary mt-2 hover:underline"
                        >
                          Change phone number
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check size={20} />
                        <span>Phone verified: {phone}</span>
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="card p-6">
                      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <MapPin size={20} className="text-primary" />
                        Delivery Details
                      </h2>
                      
                      <div className="space-y-4">
                        <Input
                          label="Full Name *"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your full name"
                        />
                        
                        <Select
                          label="District *"
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          options={districts.map(d => ({ value: d.value, label: d.label }))}
                        />
                        
                        <TextArea
                          label="Full Address *"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="House/Flat no, Road, Area, etc."
                          rows={3}
                        />
                        
                        <Input
                          label="Area (Optional)"
                          value={formData.area}
                          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                          placeholder="Specific area or landmark"
                        />
                      </div>
                    </div>

                    <div className="card p-6">
                      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Truck size={20} className="text-primary" />
                        Courier Selection
                      </h2>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {couriers.map((courier) => (
                          <button
                            key={courier.id}
                            onClick={() => setSelectedCourier(courier.id)}
                            className={`p-4 rounded-lg border-2 transition-colors text-left ${
                              selectedCourier === courier.id
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <p className="font-medium">{courier.name}</p>
                            <p className="text-sm text-gray-500">{courier.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="card p-6">
                      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <CreditCard size={20} className="text-primary" />
                        Payment Method
                      </h2>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setSelectedPayment(method.id)}
                            className={`p-4 rounded-lg border-2 transition-colors text-left ${
                              selectedPayment === method.id
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <p className="text-2xl mb-1">{method.icon}</p>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-gray-500">{method.description}</p>
                          </button>
                        ))}
                      </div>

                      {selectedPayment !== 'cod' && (
                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-sm">
                          <p className="text-yellow-800">
                            <strong>Payment Instructions:</strong> You will receive payment details via SMS/WhatsApp after order confirmation.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => setStep(3)}
                        disabled={!formData.name || !formData.address}
                      >
                        Review Order
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="card p-6">
                      <h2 className="text-lg font-semibold mb-6">Review Your Order</h2>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-gray-500 text-sm">Delivery To:</h3>
                          <p className="font-medium">{formData.name}</p>
                          <p className="text-gray-600">{formData.address}</p>
                          <p className="text-gray-600">{currentDistrict?.label}</p>
                          <p className="text-gray-600">{phone}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-500 text-sm">Payment:</h3>
                          <p className="font-medium">
                            {paymentMethods.find(m => m.id === selectedPayment)?.name}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-500 text-sm">Courier:</h3>
                          <p className="font-medium">
                            {couriers.find(c => c.id === selectedCourier)?.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setStep(2)}
                      >
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleSubmitOrder}
                        isLoading={isLoading}
                      >
                        Place Order - {formatPrice(total)}
                      </Button>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                      By placing order, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>
                )}
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="card p-6 sticky top-20">
                  <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                    {items.map((item) => (
                      <div key={`${item.product.id}-${item.variant?.id}`} className="flex gap-3">
                        <div className="w-16 h-16 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.images[0] && (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Delivery</span>
                      <span>{formatPrice(deliveryCharge)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <a
                    href="https://wa.me/8801973811114"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-4"
                  >
                    <Button variant="ghost" className="w-full gap-2">
                      <MessageCircle size={18} />
                      Need Help?
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}