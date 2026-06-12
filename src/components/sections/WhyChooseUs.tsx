'use client';

import { motion } from 'framer-motion';
import { Award, Users, BookOpen, Zap, Globe, Target } from 'lucide-react';
import Card from '../ui/Card';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card hover className="p-8 h-full">
        <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl mb-6 text-white">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
      </Card>
    </motion.div>
  );
}

export default function WhyChooseUs() {
  const features = [
    {
      icon: <Award size={28} />,
      title: 'Industry-Relevant Curriculum',
      description: 'Our courses are designed with input from tech industry leaders to ensure students learn skills that are in high demand.',
      delay: 0,
    },
    {
      icon: <BookOpen size={28} />,
      title: 'Hands-on Projects',
      description: 'Students build real projects from day one, creating portfolios that showcase their abilities to future employers.',
      delay: 0.1,
    },
    {
      icon: <Users size={28} />,
      title: 'Certified Instructors',
      description: 'Our teachers are certified professionals with real-world experience in technology and education.',
      delay: 0.2,
    },
    {
      icon: <Zap size={28} />,
      title: 'Small Class Sizes',
      description: 'We maintain low student-to-teacher ratios to ensure personalized attention for every child.',
      delay: 0.3,
    },
    {
      icon: <Target size={28} />,
      title: 'Future-Ready Skills',
      description: 'Focus on emerging technologies like AI, robotics, and coding to prepare students for tomorrow\'s careers.',
      delay: 0.4,
    },
    {
      icon: <Globe size={28} />,
      title: 'International Standards',
      description: 'Our curriculum meets global STEM education standards, giving students a competitive edge worldwide.',
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
            Why Choose Codereality Academy?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We're committed to providing the best STEM education experience for your child
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
