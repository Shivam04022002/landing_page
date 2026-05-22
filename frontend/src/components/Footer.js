import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Shield, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Business Loans', href: '#loan-form' },
    { label: 'Working Capital', href: '#loan-form' },
    { label: 'Machinery Finance', href: '#loan-form' },
    { label: 'Inventory Loan', href: '#loan-form' }
  ];

  const companyLinks = [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Partner with Us', href: '#' },
    { label: 'Contact', href: '#' }
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Grievance Redressal', href: '#' }
  ];

  const scrollToSection = (href) => {
    if (href === '#loan-form') {
      const element = document.getElementById('loan-form');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-dark-900 border-t border-white/5">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold gradient-text mb-4">
              FinanceCo
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Your trusted partner for quick business loans. 
              Helping SMEs grow with flexible financing solutions since 2008.
            </p>
            <div className="space-y-3">
              <a href="mailto:support@financeco.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm">
                <Mail className="w-4 h-4" />
                support@financeco.com
              </a>
              <a href={`tel:${process.env.REACT_APP_CALL_NUMBER || '1234567890'}`} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm">
                <Phone className="w-4 h-4" />
                {process.env.REACT_APP_CALL_NUMBER || '+91 123 456 7890'}
              </a>
              <div className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>123 Business District, Mumbai, Maharashtra 400001</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-white font-semibold mb-4">Loan Products</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-white/5"
        >
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Shield className="w-5 h-5" />
              <span>RBI Registered NBFC</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <ExternalLink className="w-4 h-4" />
              <span>256-bit SSL Security</span>
            </div>
            <div className="text-gray-500 text-sm">
              ISO 27001:2013 Certified
            </div>
            <div className="text-gray-500 text-sm">
              CIN: U67120MH2008PTC123456
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              {currentYear} FinanceCo. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs text-center md:text-right max-w-md">
              Disclaimer: FinanceCo is a registered Non-Banking Financial Company (NBFC) 
              regulated by the Reserve Bank of India. Loans are subject to eligibility 
              and terms and conditions apply.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
