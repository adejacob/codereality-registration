'use client';

import { motion } from 'framer-motion';
import { Cpu, Code2, Bot, GraduationCap, Award, ShieldCheck } from 'lucide-react';

interface BadgeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function Badge({ icon, title, description, delay }: BadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, type: 'spring' }}
      className="text-center p-6"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl mb-4 text-white shadow-lg">
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
  );
}

export default function TrustBadges() {
  const badges = [
    {
      icon: <Cpu size={32} />,
      title: 'STEM Education',
      description: 'Certified STEM curriculum',
      delay: 0,
    },
    {
      icon: <Code2 size={32} />,
      title: 'Coding for Kids',
      description: 'Age-appropriate programming',
      delay: 0.1,
    },
    {
      icon: <Bot size={32} />,
      title: 'Robotics Training',
      description: 'Hands-on robotics labs',
      delay: 0.2,
    },
    {
      icon: <GraduationCap size={32} />,
      title: 'Expert Instructors',
      description: 'Certified teachers',
      delay: 0.3,
    },
    {
      icon: <Award size={32} />,
      title: 'Quality Assurance',
      description: 'International standards',
      delay: 0.4,
    },
    {
      icon: <ShieldCheck size={32} />,
      title: 'Safe Environment',
      description: 'Child-friendly spaces',
      delay: 0.5,
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Parents
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our commitment to excellence in STEM education
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {badges.map((badge, index) => (
            <Badge key={index} {...badge} />
          ))}
        </div>
      </div>
    </section>
  );
}
