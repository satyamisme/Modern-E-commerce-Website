import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Contact: React.FC = () => {
  const { showToast } = useShop();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Message sent! We will get back to you soon.', 'success');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
             <p className="text-lg text-gray-500 max-w-2xl mx-auto">Have questions about a product or order? We're here to help you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Phone size={24} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Phone Support</h3>
                <p className="text-gray-500 mb-4">24/7 Support Line</p>
                <a href="tel:1800586462" className="text-accent font-bold hover:underline">1800-LAKKI</a>
             </div>
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Mail size={24} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Email Us</h3>
                <p className="text-gray-500 mb-4">We reply within 24 hours</p>
                <a href="mailto:support@lakkiphones.com" className="text-accent font-bold hover:underline">support@lakkiphones.com</a>
             </div>
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <MessageCircle size={24} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Live Chat</h3>
                <p className="text-gray-500 mb-4">Chat with Lakki AI</p>
                <button className="text-accent font-bold hover:underline">Start Chat</button>
             </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row">
             <div className="lg:w-1/2 p-8 lg:p-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-accent focus:bg-white transition-colors"
                        placeholder="Ahmed Al-Sabah"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-accent focus:bg-white transition-colors"
                        placeholder="ahmed@example.com"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                      <textarea 
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-accent focus:bg-white transition-colors h-32 resize-none"
                        placeholder="How can we help you?"
                      />
                   </div>
                   <button 
                     type="submit" 
                     className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2"
                   >
                      Send Message <Send size={18} />
                   </button>
                </form>
             </div>
             <div className="lg:w-1/2 bg-gray-100 relative min-h-[400px]">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d111285.90374112265!2d47.906977797775535!3d29.36034179373977!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3fcf841757876273%3A0x8683e9114d94d3c3!2sKuwait%20City!5e0!3m2!1sen!2skw!4v1709403328543!5m2!1sen!2skw" 
                  width="100%" 
                  height="100%" 
                  style={{border:0}} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                ></iframe>
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg">
                   <div className="flex items-start gap-3">
                      <MapPin className="text-accent mt-1" size={20} />
                      <div>
                         <h4 className="font-bold text-gray-900">LAKKI PHONES HQ</h4>
                         <p className="text-sm text-gray-600">Al Hamra Tower, 35th Floor</p>
                         <p className="text-sm text-gray-600">Kuwait City, Kuwait</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};