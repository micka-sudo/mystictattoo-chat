// src/components/AnimatedSection.js
import React from 'react';
import { motion } from 'framer-motion';

const AnimatedSection = ({ children, delay = 0 }) => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: delay }}
        >
            {children}
        </motion.section>
    );
};

export default AnimatedSection;
