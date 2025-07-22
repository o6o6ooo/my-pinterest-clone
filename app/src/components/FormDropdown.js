import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon } from '@heroicons/react/24/outline';

function FormDropdown({
    label,
    options,
    selected,
    onSelect,
    disabled = false,
    id
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // ドロップダウン外クリックで閉じる処理
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <label
                htmlFor={id}
                className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none"
            >
                {label}
            </label>
            <button
                id={id}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full border border-[#0A4A6E] rounded-lg p-3 pt-6 pb-3 text-[#0A4A6E] bg-white flex justify-between items-center
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                {selected ? selected.name || selected.label || selected.value : `Select ${label}`}
                <ChevronDownIcon className="w-5 h-5 text-[#0A4A6E]" />
            </button>

            {isOpen && (
                <div
                    role="listbox"
                    className="absolute top-full mt-1 w-full border border-[#0A4A6E] rounded-lg bg-white shadow z-50 max-h-60 overflow-auto"
                >
                    {options.length === 0 && (
                        <div className="p-3 text-sm text-gray-500">No options</div>
                    )}
                    {options.map((option) => (
                        <button
                            key={option.id || option.value}
                            type="button"
                            className="w-full text-left p-3 hover:bg-gray-100 text-[#0A4A6E]"
                            onClick={() => {
                                onSelect(option);
                                setIsOpen(false);
                            }}
                            role="option"
                            aria-selected={selected === option}
                        >
                            {option.name || option.label || option.value}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FormDropdown;