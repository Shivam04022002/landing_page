import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Users, Clock, Banknote, FileCheck } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: '100% Secure',
    description: 'Bank-level encryption protects your data'
  },
  {
    icon: Award,
    title: 'RBI Registered',
    description: 'Licensed and regulated financial institution'
  },
  {
    icon: Users,
    title: '10,000+ Happy Customers',
    description: 'Trusted by businesses across India'
  },
  {
    icon: Clock,
    title: '24 Hour Disbursal',
    description: 'Quick loan processing and approval'
  },
  {
    icon: Banknote,
    title: 'No Hidden Charges',
    description: 'Transparent pricing, no surprises'
  },
  {
    icon: FileCheck,
    title: 'Digital Process',
    description: 'Paperless application and verification'
  }
];

const TrustBadges = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark-800" />
      
      {/* Content */}
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
            Why Choose Us?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We make business financing simple, fast, and hassle-free. 
            Join thousands of satisfied business owners.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-card rounded-2xl p-6 group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary-600/20 to-gold-500/20 flex items-center justify-center group-hover:from-primary-600/30 group-hover:to-gold-500/30 transition-all duration-300 border border-gold-500/20">
                  <feature.icon className="w-7 h-7 text-gold-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 pt-16 border-t border-gold-500/20"
        >
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-gold-400 mb-1">15+</div>
              <p className="text-sm text-gray-400">Years Experience</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gold-400 mb-1">50+</div>
              <p className="text-sm text-gray-400">Partner Banks</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gold-400 mb-1">500Cr+</div>
              <p className="text-sm text-gray-400">Loans Disbursed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gold-400 mb-1">50+</div>
              <p className="text-sm text-gray-400">Cities Covered</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustBadges;
