
import React from 'react';
import { Lock, FileText } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
         
         <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
               <Lock className="text-primary" size={28} />
               <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
            </div>
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
               <p>
                  Your privacy is important to us. It is LAKKI PHONES' policy to respect your privacy regarding any information we may collect from you across our website.
               </p>
               <h4 className="font-bold text-gray-900">Information We Collect</h4>
               <p>
                  We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
               </p>
               <h4 className="font-bold text-gray-900">Data Retention</h4>
               <p>
                  We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.
               </p>
               <h4 className="font-bold text-gray-900">Sharing</h4>
               <p>
                  We don’t share any personally identifying information publicly or with third-parties, except when required to by law.
               </p>
            </div>
         </div>

         <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
               <FileText className="text-primary" size={28} />
               <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
            </div>
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
               <h4 className="font-bold text-gray-900">1. Terms</h4>
               <p>
                  By accessing the website at LAKKI PHONES, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
               </p>
               <h4 className="font-bold text-gray-900">2. Use License</h4>
               <p>
                  Permission is granted to temporarily download one copy of the materials (information or software) on LAKKI PHONES' website for personal, non-commercial transitory viewing only.
               </p>
               <h4 className="font-bold text-gray-900">3. Disclaimer</h4>
               <p>
                  The materials on LAKKI PHONES' website are provided on an 'as is' basis. LAKKI PHONES makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
               </p>
            </div>
         </div>

      </div>
    </div>
  );
};
