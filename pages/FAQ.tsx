
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const FAQ: React.FC = () => {
  const faqs = [
    {
      category: "Orders & Shipping",
      items: [
        { q: "How long does delivery take?", a: "We offer express next-day delivery for all orders placed before 5 PM in Kuwait. Standard delivery takes 1-2 business days." },
        { q: "Do you ship internationally?", a: "Currently, we only serve customers within Kuwait." },
        { q: "How can I track my order?", a: "You can track your order status in the 'My Account' section or use the tracking link sent to your email." }
      ]
    },
    {
      category: "Payment",
      items: [
        { q: "What payment methods do you accept?", a: "We accept KNET, Visa, MasterCard, and Cash on Delivery (for orders under 100 KWD)." },
        { q: "Is it safe to use my credit card?", a: "Yes, all transactions are encrypted and processed through secure payment gateways." }
      ]
    },
    {
      category: "Warranty & Returns",
      items: [
        { q: "Do products come with a warranty?", a: "Yes, all smartphones come with a minimum 1-year official manufacturer warranty." },
        { q: "What is your return policy?", a: "You can return sealed, unopened items within 14 days of purchase. Defective items can be exchanged within the warranty period." }
      ]
    }
  ];

  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
           <HelpCircle size={48} className="mx-auto text-primary mb-4" />
           <h1 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
           <p className="text-gray-500">Find answers to common questions about LAKKI PHONES</p>
        </div>

        <div className="space-y-8">
           {faqs.map((section, idx) => (
              <div key={idx}>
                 <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">{section.category}</h2>
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {section.items.map((item, i) => {
                       const id = `${idx}-${i}`;
                       const isOpen = openIndex === id;
                       return (
                          <div key={i} className="border-b border-gray-100 last:border-0">
                             <button 
                                onClick={() => toggle(id)}
                                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                             >
                                <span className="font-medium text-gray-900">{item.q}</span>
                                {isOpen ? <ChevronUp size={18} className="text-accent" /> : <ChevronDown size={18} className="text-gray-400" />}
                             </button>
                             {isOpen && (
                                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed animate-in slide-in-from-top-2">
                                   {item.a}
                                </div>
                             )}
                          </div>
                       );
                    })}
                 </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
};
