import React from 'react';
import { HelpCircle } from 'lucide-react';

const HelpSection: React.FC = () => {
  return (
    <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
      <div className="flex items-start space-x-3">
        <HelpCircle className="text-blue-600 mt-0.5" size={18} />
        <div>
          <p className="text-sm font-medium text-blue-900 mb-1">Need help?</p>
          <p className="text-xs text-blue-700 mb-2">Check our documentation or contact support</p>
          <button className="text-xs px-3 py-1.5 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
            Get Help
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpSection;