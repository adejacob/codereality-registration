'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';

const testimonials = [
  {
    name: 'Mrs. Adeyemi',
    role: 'Parent',
    content: 'My son has transformed from a curious kid to a confident coder. The instructors are patient and the curriculum is excellent. Highly recommended!',
    rating: 5,
    image: '👩',
  },
  {
    name: 'Mr. Okonkwo',
    role: 'Parent',
    content: 'Codereality Academy has given my daughter a head start in technology. She\'s now building her own apps and dreams of becoming a software engineer.',
    rating: 5,
    image: '👨',
  },
  {
    name: 'Dr. Ibrahim',
    role: 'Parent',
    content: 'The hands-on approach to learning robotics is amazing. My children look forward to every class. The investment is worth every penny.',
    rating: 5,
    image: '👨‍⚕️',
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            What Parents Say
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Hear from families who have experienced the Codereality difference
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-8 md:p-12">
                <div className="flex items-start gap-6">
                  <div className="text-6xl">{testimonials[currentIndex].image}</div>
                  <div className="flex-1">
                    <Quote className="text-indigo-500 mb-4" size={32} />
                    <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                      {testimonials[currentIndex].content}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                        <Star key={i} className="fill-yellow-400 text-yellow-400" size={20} />
                      ))}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">
                        {testimonials[currentIndex].name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">{testimonials[currentIndex].role}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                <ChevronLeft className="text-indigo-600 dark:text-indigo-400" size={24} />
              </button>
              <button
                onClick={nextTestimonial}
                className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                <ChevronRight className="text-indigo-600 dark:text-indigo-400" size={24} />
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-indigo-600 w-8'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
