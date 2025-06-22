import React from 'react';
import AdBanner from './AdBanner';
import { getAdSlot } from '@/config/adsense';
import { useAuth } from '@/hooks/useAuth';

const Footer: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              StudyMentor
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Your AI-powered study assistant for effective learning through active recall, 
              spaced repetition, and personalized study methods.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Privacy Policy"
              >
                Privacy
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Terms of Service"
              >
                Terms
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Contact Us"
              >
                Contact
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Active Recall</li>
              <li>Spaced Repetition</li>
              <li>Feynman Method</li>
              <li>Interleaved Studying</li>
              <li>Canvas Integration</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Help Center</li>
              <li>Documentation</li>
              <li>API Reference</li>
              <li>Community</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2024 StudyMentor. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-xs text-gray-400">
                Made with ❤️ for students
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Non-intrusive ad banner at the very bottom */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdBanner 
            adSlot={getAdSlot('FOOTER_BANNER')}
            adFormat="auto"
            className="py-4"
            isAuthenticated={isAuthenticated}
            style={{
              maxWidth: '728px',
              margin: '0 auto',
              backgroundColor: '#fafafa'
            }}
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer; 