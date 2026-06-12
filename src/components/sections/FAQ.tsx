'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../ui/Card';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  delay: number;
}

function FAQItem({ question, answer, isOpen, onClick, delay }: FAQItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="overflow-hidden">
        <button
          onClick={onClick}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
            {question}
          </h3>
          {isOpen ? (
            <ChevronUp className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" size={24} />
          ) : (
            <ChevronDown className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" size={24} />
          )}
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
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                {answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: 'What age groups do you teach?',
      answer: 'We offer programs for children aged 4-16 years. Our courses are specifically designed for different age groups to ensure age-appropriate learning and engagement.',
      delay: 0,
    },
    {
      question: 'Do students need prior coding experience?',
      answer: 'No prior experience is required! Our curriculum is designed for beginners and progressively builds up skills. We start with fundamentals and advance to more complex concepts.',
      delay: 0.1,
    },
    {
      question: 'What is the class schedule?',
      answer: 'We offer flexible scheduling options including weekend classes, after-school programs, holiday bootcamps, and private coaching. You can choose the schedule that best fits your child\'s routine.',
      delay: 0.2,
    },
    {
      question: 'What equipment do students need?',
      answer: 'For most programs, we provide all necessary equipment during class. For home practice, a computer or tablet with internet access is recommended. We\'ll provide specific requirements based on the enrolled program.',
      delay: 0.3,
    },
    {
      question: 'How do you track student progress?',
      answer: 'We provide regular progress reports, parent-teacher meetings, and showcase events where students demonstrate their projects. Parents also have access to our learning portal to track their child\'s progress.',
      delay: 0.4,
    },
    {
      question: 'What payment options are available?',
      answer: 'We offer flexible payment options including full payment and installment plans. We also accept various payment methods and can discuss customized payment solutions if needed.',
      delay: 0.5,
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions about our programs
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
              delay={faq.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
