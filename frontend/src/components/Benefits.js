import React from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Calculator, 
  Wallet, 
  Receipt, 
  CreditCard, 
  PiggyBank,
  ArrowRight
} from 'lucide-react';

const loanTypes = [
  {
    icon: Rocket,
    title: 'Business Expansion',
    description: 'Scale your business operations with flexible funding options',
    amount: '₹5L - ₹50L',
    interest: 'From 12% p.a.',
    color: 'from-primary-600 to-primary-800'
  },
  {
    icon: Wallet,
    title: 'Working Capital',
    description: 'Manage daily operations and cash flow smoothly',
    amount: '₹2L - ₹30L',
    interest: 'From 13% p.a.',
    color: 'from-gold-500 to-gold-600'
  },
  {
    icon: Calculator,
    title: 'Inventory Finance',
    description: 'Stock up inventory without straining your finances',
    amount: '₹3L - ₹25L',
    interest: 'From 12.5% p.a.',
    color: 'from-primary-600 to-gold-500'
  },
  {
    icon: Receipt,
    title: 'Machinery Loan',
    description: 'Purchase or upgrade equipment with ease',
    amount: '₹10L - ₹50L',
    interest: 'From 11% p.a.',
    color: 'from-primary-800 to-primary-600'
  },
  {
    icon: CreditCard,
    title: 'Business Term Loan',
    description: 'Long-term funding for business growth initiatives',
    amount: '₹10L - ₹50L',
    interest: 'From 12% p.a.',
    color: 'from-gold-600 to-gold-500'
  },
  {
    icon: PiggyBank,
    title: 'Startup Funding',
    description: 'Early-stage capital for promising new ventures',
    amount: '₹5L - ₹25L',
    interest: 'From 14% p.a.',
    color: 'from-primary-600 to-primary-500'
  }
];

const Benefits = () => {
  const scrollToForm = () => {
    const formElement = document.getElementById('loan-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark-900" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Quick Loan Benefits
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose from our range of business loan products designed to meet your specific needs. 
            Competitive rates, flexible terms, and fast approval.
          </p>
        </motion.div>

        {/* Loan Types Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {loanTypes.map((loan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="glass-card rounded-2xl p-6 group cursor-pointer relative overflow-hidden"
            >
              {/* Gradient Border Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${loan.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${loan.color} bg-opacity-20 flex items-center justify-center mb-4`}>
                  <loan.icon className="w-7 h-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-2">
                  {loan.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-4">
                  {loan.description}
                </p>

                {/* Details */}
                <div className="flex items-center justify-between pt-4 border-t border-gold-500/20">
                  <div>
                    <p className="text-xs text-gray-500">Loan Amount</p>
                    <p className="text-sm font-semibold text-white">{loan.amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Interest Rate</p>
                    <p className="text-sm font-semibold text-gold-400">{loan.interest}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card rounded-2xl p-8 text-center border border-gold-500/20"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to grow your business?
          </h3>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Get personalized loan offers tailored to your business needs. 
            Apply now and receive funds within 24 hours.
          </p>
          <motion.button
            onClick={scrollToForm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold rounded-xl inline-flex items-center gap-2 shadow-lg shadow-primary-500/30 transition-all"
          >
            Apply for Loan
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Benefits;
