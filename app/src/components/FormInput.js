import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

export default function FormInput({
    label,
    id,
    type = 'text',
    value,
    onChange,
    required = false,
    disabled = false,
    autoComplete,
    readOnly = false,
    variant,
}) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const isReadonly = variant === 'readonly';

    return (
        <div className="relative w-full">
            <label
                htmlFor={id}
                className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none"
            >
                {label}
            </label>
            <input
                type={isPassword ? (showPassword ? 'text' : 'password') : type}
                id={id}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled || isReadonly}
                autoComplete={autoComplete}
                readOnly={readOnly || isReadonly}
                className="w-full border border-[#0A4A6E] rounded-lg p-3 pt-6 pb-3 text-[#0A4A6E] 
                ${isReadonly
                    ? 'bg-[#dfdfdf] text-gray-600 border-[#0A4A6E]'
                    : 'bg-white text-[#0A4A6E] border-[#0A4A6E]'} 
                focus:outline-none focus:ring-1 focus:ring-[#0A4A6E] transition-all shadow-md"
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-[#0A4A6E] hover:text-[#08324E]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={disabled}
                >
                    {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                        <EyeIcon className="w-5 h-5" />
                    )}
                </button>
            )}
        </div>
    );
}