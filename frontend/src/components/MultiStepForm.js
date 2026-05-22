import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ChevronRight, ChevronLeft, Check, Loader2, IndianRupee, Building2, TrendingUp, User, Phone, MapPin, MapPinned } from 'lucide-react';
import { createLead } from '../utils/api';
import axios from 'axios';

const steps = [
  { id: 1, title: 'Location' },
  { id: 2, title: 'Loan Details' },
  { id: 3, title: 'Financial Health' },
  { id: 4, title: 'Business Info' }
];

const useOfFundsOptions = [
  'Business Expansion',
  'Inventory',
  'Machinery',
  'Working Capital',
  'Personal Use',
  'Other'
];

const businessVintageOptions = [
  'Less than 1 year',
  '1-3 years',
  '3-5 years',
  '5+ years'
];

const creditScoreOptions = [
  'Below 550',
  '550-650',
  '650-750',
  '750+'
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
};

const MultiStepForm = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState({
    state: false,
    district: false,
    country: false
  });
  const [pinCodeError, setPinCodeError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    reset,
    setValue,
    watch
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      desiredLoanAmount: '',
      useOfFunds: '',
      averageMonthlySale: '',
      businessVintage: '',
      creditScore: '',
      businessName: '',
      ownerName: '',
      phoneNumber: '',
      pinCode: '',
      state: '',
      district: '',
      country: ''
    }
  });

  // Helper function to fetch address by PIN code (via backend proxy)
  const fetchAddressByPincode = useCallback(async (pincode) => {
    // Reset states
    setPinCodeError('');
    setIsFetchingPin(true);

    try {
      // Use backend proxy to avoid CORS issues
      const response = await axios.get(`/api/pincode/${pincode}`);

      if (
        response.data.success &&
        response.data.data &&
        response.data.data[0] &&
        response.data.data[0].Status === 'Success' &&
        response.data.data[0].PostOffice &&
        response.data.data[0].PostOffice.length > 0
      ) {
        const postOffice = response.data.data[0].PostOffice[0];

        // Auto-fill fields
        setValue('state', postOffice.State || '', { shouldValidate: true });
        setValue('district', postOffice.District || '', { shouldValidate: true });
        setValue('country', postOffice.Country || 'India', { shouldValidate: true });

        // Mark fields as auto-filled (readonly)
        setAutoFilledFields({
          state: true,
          district: true,
          country: true
        });

        toast.success('Pin Code fetched successfully!');
      } else {
        // Invalid PIN code
        setPinCodeError('Invalid PIN Code. Please enter valid address manually.');

        // Clear auto-filled fields but allow manual entry
        setValue('state', '', { shouldValidate: false });
        setValue('district', '', { shouldValidate: false });
        setValue('country', '', { shouldValidate: false });

        setAutoFilledFields({
          state: false,
          district: false,
          country: false
        });
      }
    } catch (error) {
      console.error('PIN Code API Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Show specific error message
      let errorMsg = 'Failed to fetch address. Please enter manually.';
      if (error.response?.status === 503) {
        errorMsg = 'Postal service temporarily unavailable. Please enter manually.';
      } else if (error.response?.status === 404) {
        errorMsg = 'PIN code service not found. Please enter manually.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMsg = 'Cannot connect to backend server. Please check if server is running.';
      }
      
      setPinCodeError(errorMsg);

      // Allow manual entry on error
      setAutoFilledFields({
        state: false,
        district: false,
        country: false
      });
    } finally {
      setIsFetchingPin(false);
    }
  }, [setValue]);

  // Watch PIN code changes with debounce
  const pinCodeValue = watch('pinCode');
  
  useEffect(() => {
    let timeoutId;
    
    if (pinCodeValue && /^\d{6}$/.test(pinCodeValue)) {
      // Debounce API call by 500ms
      timeoutId = setTimeout(() => {
        fetchAddressByPincode(pinCodeValue);
      }, 500);
    } else if (pinCodeValue && pinCodeValue.length < 6) {
      // Clear error and auto-filled status when PIN is incomplete
      setPinCodeError('');
      setAutoFilledFields({
        state: false,
        district: false,
        country: false
      });
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pinCodeValue, fetchAddressByPincode]);

  const validateStep = async (step) => {
    let fieldsToValidate = [];

    switch (step) {
      case 1:
        fieldsToValidate = ['pinCode', 'state', 'district', 'country'];
        break;
      case 2:
        fieldsToValidate = ['desiredLoanAmount', 'useOfFunds'];
        break;
      case 3:
        fieldsToValidate = ['averageMonthlySale', 'businessVintage', 'creditScore'];
        break;
      case 4:
        fieldsToValidate = ['businessName', 'ownerName', 'phoneNumber'];
        break;
      default:
        break;
    }

    const result = await trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 4) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Track Google Ads conversion
      if (window.gtag) {
        window.gtag('event', 'conversion', {
          send_to: process.env.REACT_APP_GOOGLE_ANALYTICS_ID + '/lead_form_submit',
          value: data.desiredLoanAmount,
          currency: 'INR'
        });
      }

      // Track Facebook Pixel Lead event
      if (window.fbq) {
        window.fbq('track', 'Lead', {
          content_name: 'Loan Application',
          content_category: data.useOfFunds,
          value: data.desiredLoanAmount,
          currency: 'INR'
        });
      }

      await createLead(data);
      setIsSuccess(true);
      toast.success('Application submitted successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setCurrentStep(1);
    setIsSuccess(false);
    setDirection(0);
  };

  // Success Screen
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-8 px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center"
        >
          <svg
            className="w-12 h-12 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
        
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl md:text-2xl font-bold text-gray-900 mb-2"
        >
          Thank You For Submitting!
        </motion.h3>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-gray-500 mb-6"
        >
          Our team will contact you shortly
        </motion.p>
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Back to Home
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: currentStep >= step.id ? '#f97316' : '#f3f4f6',
                  borderColor: currentStep >= step.id ? '#f97316' : '#e5e7eb'
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold text-sm transition-colors"
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span className={currentStep >= step.id ? 'text-white' : 'text-gray-500'}>
                    {step.id}
                  </span>
                )}
              </motion.div>
              {index < steps.length - 1 && (
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: currentStep > step.id ? '#f97316' : '#e5e7eb'
                  }}
                  className="w-16 md:w-24 h-1 mx-2 rounded-full transition-colors"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs md:text-sm">
          {steps.map((step) => (
            <span
              key={step.id}
              className={`${currentStep >= step.id ? 'text-orange-500 font-medium' : 'text-gray-400'}`}
            >
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="space-y-5"
          >
            {/* Step 1: Location (PIN + Address) */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* PIN Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    PIN Code
                    {isFetchingPin && (
                      <span className="ml-2 inline-flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                        <span className="ml-1 text-xs text-gray-500">Fetching address...</span>
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    {...register('pinCode', {
                      required: 'PIN code is required',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'Please enter a valid 6-digit PIN code'
                      },
                      onChange: (e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setValue('pinCode', value, { shouldValidate: true });
                      }
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
                    placeholder="Enter 6-digit PIN code"
                    maxLength="6"
                    disabled={isFetchingPin}
                  />
                  {errors.pinCode && (
                    <p className="mt-1 text-sm text-orange-600">{errors.pinCode.message}</p>
                  )}
                  {pinCodeError && (
                    <p className="mt-1 text-sm text-red-500">{pinCodeError}</p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPinned className="inline w-4 h-4 mr-1" />
                    State
                    {autoFilledFields.state && (
                      <span className="ml-2 text-xs text-green-600">(Auto-filled)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    {...register('state', { required: 'State is required' })}
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none ${
                      autoFilledFields.state ? 'bg-green-50 border-green-200 text-green-800' : ''
                    }`}
                    placeholder="State"
                    readOnly={autoFilledFields.state}
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-orange-600">{errors.state.message}</p>
                  )}
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District
                    {autoFilledFields.district && (
                      <span className="ml-2 text-xs text-green-600">(Auto-filled)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    {...register('district', { required: 'District is required' })}
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none ${
                      autoFilledFields.district ? 'bg-green-50 border-green-200 text-green-800' : ''
                    }`}
                    placeholder="District"
                    readOnly={autoFilledFields.district}
                  />
                  {errors.district && (
                    <p className="mt-1 text-sm text-orange-600">{errors.district.message}</p>
                  )}
                </div>

                                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                    {autoFilledFields.country && (
                      <span className="ml-2 text-xs text-green-600">(Auto-filled)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    {...register('country', { required: 'Country is required' })}
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none ${
                      autoFilledFields.country ? 'bg-green-50 border-green-200 text-green-800' : ''
                    }`}
                    placeholder="Country"
                    readOnly={autoFilledFields.country}
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-orange-600">{errors.country.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Loan Details */}
            {currentStep === 2 && (
              <div className="space-y-5">
                {/* Loan Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <IndianRupee className="inline w-4 h-4 mr-1" />
                    Desired Loan Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      type="number"
                      {...register('desiredLoanAmount', {
                        required: 'Loan amount is required',
                        valueAsNumber: true,
                        min: { value: 10000, message: 'Minimum loan amount is ₹10,000' }
                      })}
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
                      placeholder="Enter amount"
                    />
                  </div>
                  {errors.desiredLoanAmount && (
                    <p className="mt-1 text-sm text-orange-600">{errors.desiredLoanAmount.message}</p>
                  )}
                </div>

                {/* Use of Funds */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="inline w-4 h-4 mr-1" />
                    Use of Funds
                  </label>
                  <select
                    {...register('useOfFunds', { required: 'Please select use of funds' })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all appearance-none cursor-pointer outline-none"
                  >
                    <option value="" className="bg-white">Select purpose</option>
                    {useOfFundsOptions.map(option => (
                      <option key={option} value={option} className="bg-white text-gray-900">{option}</option>
                    ))}
                  </select>
                  {errors.useOfFunds && (
                    <p className="mt-1 text-sm text-orange-600">{errors.useOfFunds.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Financial Health */}
            {currentStep === 3 && (
              <div className="space-y-5">
                {/* Monthly Sale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <TrendingUp className="inline w-4 h-4 mr-1" />
                    Average Monthly Sale
                  </label>
                  <select
                    {...register('averageMonthlySale', { required: 'Please select monthly sale range' })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all appearance-none cursor-pointer outline-none"
                  >
                    <option value="" className="bg-white">Select monthly sale range</option>
                    <option value="50k-1.5L" className="bg-white text-gray-900">₹50,000 - ₹1,50,000</option>
                    <option value="1.5L-3L" className="bg-white text-gray-900">₹1,50,000 - ₹3,00,000</option>
                    <option value="3L-5L" className="bg-white text-gray-900">₹3,00,000 - ₹5,00,000</option>
                    <option value="5L+" className="bg-white text-gray-900">₹5,00,000+</option>
                  </select>
                  {errors.averageMonthlySale && (
                    <p className="mt-1 text-sm text-orange-600">{errors.averageMonthlySale.message}</p>
                  )}
                </div>

                {/* Business Vintage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Vintage
                  </label>
                  <select
                    {...register('businessVintage', { required: 'Please select business vintage' })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all appearance-none cursor-pointer outline-none"
                  >
                    <option value="" className="bg-white">Select vintage</option>
                    {businessVintageOptions.map(option => (
                      <option key={option} value={option} className="bg-white text-gray-900">{option}</option>
                    ))}
                  </select>
                  {errors.businessVintage && (
                    <p className="mt-1 text-sm text-orange-600">{errors.businessVintage.message}</p>
                  )}
                </div>

                {/* Credit Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Personal Credit Score
                  </label>
                  <select
                    {...register('creditScore', { required: 'Please select credit score range' })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all appearance-none cursor-pointer outline-none"
                  >
                    <option value="" className="bg-white">Select credit score</option>
                    {creditScoreOptions.map(option => (
                      <option key={option} value={option} className="bg-white text-gray-900">{option}</option>
                    ))}
                  </select>
                  {errors.creditScore && (
                    <p className="mt-1 text-sm text-orange-600">{errors.creditScore.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Business Info */}
            {currentStep === 4 && (
              <div className="space-y-5">
                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="inline w-4 h-4 mr-1" />
                    Business Name
                  </label>
                  <input
                    type="text"
                    {...register('businessName', {
                      required: 'Business name is required',
                      maxLength: { value: 100, message: 'Maximum 100 characters' }
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
                    placeholder="Enter business name"
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-sm text-orange-600">{errors.businessName.message}</p>
                  )}
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-1" />
                    Full Name of Owner
                  </label>
                  <input
                    type="text"
                    {...register('ownerName', {
                      required: 'Owner name is required',
                      maxLength: { value: 100, message: 'Maximum 100 characters' }
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
                    placeholder="Enter owner name"
                  />
                  {errors.ownerName && (
                    <p className="mt-1 text-sm text-orange-600">{errors.ownerName.message}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-1" />
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">+91</span>
                    <input
                      type="tel"
                      {...register('phoneNumber', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[6-9]\d{9}$/,
                          message: 'Please enter a valid 10-digit Indian mobile number'
                        }
                      })}
                      className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
                      placeholder="10-digit mobile number"
                      maxLength="10"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-orange-600">{errors.phoneNumber.message}</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
          {currentStep > 1 ? (
            <motion.button
              type="button"
              onClick={prevStep}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center px-5 py-2.5 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </motion.button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <motion.button
              type="button"
              onClick={nextStep}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </motion.button>
          ) : (
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="flex items-center px-8 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 spinner" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <Check className="w-5 h-5 ml-2" />
                </>
              )}
            </motion.button>
          )}
        </div>
      </form>

      {/* Security Note */}
      <p className="mt-6 text-center text-xs text-gray-400">
        🔒 Your information is secure and encrypted
      </p>
    </div>
  );
};

export default MultiStepForm;
