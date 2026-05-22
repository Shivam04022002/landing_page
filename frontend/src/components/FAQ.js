import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'What is the minimum loan amount I can apply for?',
    answer: 'The minimum loan amount you can apply for is ₹10,000. We offer loans ranging from ₹10,000 up to ₹50 Lakhs, depending on your business requirements and eligibility.'
  },
  {
    question: 'How long does the loan approval process take?',
    answer: 'Our loan approval process is designed to be fast and efficient. Most applications receive a decision within 24 hours, and once approved, funds are typically disbursed within 1-2 business days.'
  },
  {
    question: 'What documents are required to apply for a business loan?',
    answer: 'We require minimal documentation including: Business registration proof, PAN card, Last 6 months bank statements, GST returns (if applicable), and Address proof. Our digital process makes document submission quick and easy.'
  },
  {
    question: 'Do I need to provide collateral for the loan?',
    answer: 'No, we offer unsecured business loans that do not require any collateral or security. Your loan eligibility is determined based on your business performance and creditworthiness.'
  },
  {
    question: 'What are the interest rates offered?',
    answer: 'Our interest rates start from 12% per annum and vary based on your credit profile, business vintage, and loan amount. We offer competitive rates with no hidden charges.'
  },
  {
    question: 'Can I prepay my loan? Are there any charges?',
    answer: 'Yes, you can prepay your loan after 6 months. Prepayment charges are minimal (2-4% depending on the loan tenure completed) and clearly communicated upfront in your loan agreement.'
  },
  {
    question: 'What is the maximum repayment tenure available?',
    answer: 'We offer flexible repayment tenures ranging from 6 months to 60 months (5 years). You can choose a tenure that best suits your cash flow and business needs.'
  },
  {
    question: 'Is there any processing fee?',
    answer: 'Yes, we charge a one-time processing fee of 2-3% of the loan amount, which is deducted from the disbursed amount. There are no other hidden charges.'
  }
];

const FAQItem = ({ faq, isOpen, onToggle, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="border-b border-white/10 last:border-b-0"
    >
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="text-white font-medium pr-4 group-hover:text-blue-400 transition-colors">
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-gray-400 leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="py-20 relative overflow-hidden" id="faq">
      {/* Background */}
      <div className="absolute inset-0 bg-dark-800" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400">Got Questions?</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400">
            Find answers to common questions about our business loans
          </p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => toggleFAQ(index)}
              index={index}
            />
          ))}
        </motion.div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 mb-4">
            Still have questions? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${process.env.REACT_APP_CALL_NUMBER || '1234567890'}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Us Now
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
