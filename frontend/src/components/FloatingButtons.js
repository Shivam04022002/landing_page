import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, ChevronUp } from 'lucide-react';

const FloatingButtons = () => {
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '1234567890';
  const callNumber = process.env.REACT_APP_CALL_NUMBER || '1234567890';

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling past hero
      const scrollPosition = window.scrollY;
      setShowStickyCTA(scrollPosition > 400);
      
      // Show scroll to top button
      setShowScrollTop(scrollPosition > 800);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToForm = () => {
    const formElement = document.getElementById('loan-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-lg"
            >
              <ChevronUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* WhatsApp Button */}
        <motion.a
          href={`https://wa.me/${whatsappNumber}?text=Hi,%20I'm%20interested%20in%20getting%20a%20business%20loan.`}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg hover:shadow-green-500/30 transition-shadow floating"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.a>

        {/* Call Button */}
        <motion.a
          href={`tel:${callNumber}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg hover:shadow-orange-500/30 transition-shadow"
        >
          <Phone className="w-6 h-6" />
        </motion.a>
      </div>

      {/* Sticky Mobile CTA */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
          >
            <div className="bg-gradient-to-t from-white via-white to-transparent p-4">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={scrollToForm}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg shadow-lg"
              >
                Apply Now - Get Instant Quote
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingButtons;
