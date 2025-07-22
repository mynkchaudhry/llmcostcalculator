'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          <motion.select
            ref={ref}
            whileFocus={{ scale: 1.01 }}
            className={`
              w-full rounded-2xl border-0 bg-white/10 backdrop-blur-md
              px-4 py-3 text-gray-900 dark:text-white
              ring-1 ring-white/20 focus:ring-2 focus:ring-blue-500/50
              transition-all duration-200 appearance-none cursor-pointer
              ${error ? 'ring-red-500/50' : ''}
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                className="bg-gray-800 text-white"
              >
                {option.label}
              </option>
            ))}
          </motion.select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;