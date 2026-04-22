'use client';

import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '8801XXXXXXXXX';

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#20BD5A] transition-all duration-200 hover:scale-110 animate-pulse-glow"
      aria-label="Order via WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}

export function WhatsAppChatWidget() {
  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6">
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#20BD5A] transition-all duration-200"
      >
        <MessageCircle size={24} />
        <span className="hidden md:inline font-medium">Order on WhatsApp</span>
      </a>
    </div>
  );
}