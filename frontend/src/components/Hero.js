import React from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import MultiStepForm from './MultiStepForm';

// Surjit Finance Logo Component - Orange/Gold Theme
const SurjitLogo = () => (
  <div className="flex items-center gap-3">
    {/* SF Logo with Orange/Gold Gradient */}
    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="serif">SF</text>
      </svg>
    </div>
    <div className="flex flex-col">
      <span className="text-gray-900 font-bold text-xl tracking-tight">SURJIT FINANCE</span>
      <span className="text-orange-500 text-xs tracking-wider">TODAY . TOMORROW . TOGETHER</span>
    </div>
  </div>
);

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header with Logo */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full px-4 sm:px-6 lg:px-8 py-4 bg-white shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <SurjitLogo />
          <div className="flex items-center gap-4">
            <a
              href={`tel:${process.env.REACT_APP_CALL_NUMBER || '1800-3131-265'}`}
              className="hidden md:flex items-center gap-2 text-gray-700 hover:text-orange-500 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">{process.env.REACT_APP_CALL_NUMBER || '1800-3131-265'}</span>
            </a>
            <a
              href="#loan-form"
              className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
            >
              Apply Now
            </a>
          </div>
        </div>
      </motion.header>

      {/* Main Content - Centered Form Only */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          id="loan-form"
          className="w-full max-w-xl"
        >
          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl border border-orange-100">
            {/* Form Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Apply for Loan
              </h2>
              <p className="text-gray-500 text-sm">
                Get instant approval with minimal documentation
              </p>
            </div>

            <MultiStepForm />
          </div>

          {/* Trust Badges Below Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-600"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Quick Approval</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>© 2026 Surjit Finance. All rights reserved.</p>
      </footer>
    </section>
  );
};

export default Hero;
