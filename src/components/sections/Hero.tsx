'use client';

import { motion } from 'framer-motion';
import { Bot, Code, Brain, Box, Gamepad2, Cpu } from 'lucide-react';
import Image from 'next/image';
import Button from '../ui/Button';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter();
  const icons = [
    { icon: Bot, color: 'text-purple-500', delay: 0 },
    { icon: Code, color: 'text-blue-500', delay: 0.2 },
    { icon: Brain, color: 'text-cyan-500', delay: 0.4 },
    { icon: Box, color: 'text-green-500', delay: 0.6 },
    { icon: Gamepad2, color: 'text-orange-500', delay: 0.8 },
    { icon: Cpu, color: 'text-pink-500', delay: 1 },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-indigo-200/30 to-purple-200/30 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-cyan-200/30 to-blue-200/30 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-full blur-3xl"
        />
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {icons.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 100 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              y: [0, -20, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 4,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute ${item.color}`}
            style={{
              top: `${20 + index * 15}%`,
              left: `${10 + index * 15}%`,
            }}
          >
            <item.icon size={40} />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-3xl overflow-hidden bg-white shadow-xl shadow-indigo-500/20">
              <Image
                src="/title-logo.jpeg"
                alt="Codereality Academy"
                width={96}
                height={96}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-full text-sm font-semibold mb-6"
          >
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            Admission Open for 2025
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent"
          >
            Join the Future of Innovation
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-base md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Enroll in Codereality Academy's STEM programs and equip your child with the digital, creative, and problem-solving skills needed for tomorrow's world.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button size="lg" onClick={() => router.push('/register')}>
              Register Now →
            </Button>
            <Button variant="outline" size="lg" onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}>
              Learn More
            </Button>
          </motion.div>

          {/* STEM Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="mt-16 relative"
          >
            <div className="relative w-full max-w-3xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-20 animate-pulse" />
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { icon: Code, label: 'Coding', color: 'from-blue-500 to-cyan-500' },
                    { icon: Bot, label: 'Robotics', color: 'from-purple-500 to-pink-500' },
                    { icon: Brain, label: 'AI & ML', color: 'from-green-500 to-emerald-500' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800"
                    >
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${item.color} text-white mb-3`}>
                        <item.icon size={28} />
                      </div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{item.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-indigo-500 rounded-full flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
