'use client';

import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function StaggerContainer({ children, className, as: Tag = 'div' }) {
  const MotionTag = motion[Tag] ?? motion.div;
  return (
    <MotionTag
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerItem({ children, className, as: Tag = 'div' }) {
  const MotionTag = motion[Tag] ?? motion.div;
  return (
    <MotionTag variants={item} className={className}>
      {children}
    </MotionTag>
  );
}
