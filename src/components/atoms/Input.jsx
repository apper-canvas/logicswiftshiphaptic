import { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  const hasValue = value && value.length > 0;
  const shouldFloat = focused || hasValue;

  return (
    <div className={`relative ${className}`}>
      {/* Floating Label */}
      {label && (
        <label
          className={`absolute left-3 transition-all duration-200 ease-out pointer-events-none ${
            shouldFloat
              ? 'top-2 text-xs text-surface-600 bg-white px-1 -ml-1'
              : 'top-1/2 -translate-y-1/2 text-surface-500'
          }`}
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <ApperIcon name={icon} size={16} className="text-surface-400" />
          </div>
        )}
        
<input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full px-3 py-3 border rounded-lg text-surface-900 placeholder-surface-400 
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-error focus:ring-error' : 'border-surface-300 focus:border-primary'}
            ${disabled ? 'bg-surface-50 cursor-not-allowed' : 'bg-white'}
          `}
          {...props}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-error flex items-center">
          <ApperIcon name="AlertCircle" size={14} className="mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;