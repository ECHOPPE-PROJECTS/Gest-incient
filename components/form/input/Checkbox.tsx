import type React from "react";

interface CheckboxProps {
    label?: string;
    checked: boolean;
    className?: string;
    id?: string;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
    label,
    checked,
    id,
    onChange,
    className = "",
    disabled = false
}) => {
    return (
        <label className={`flex items-center space-x-3 group cursor-pointer ${disabled ? "cursor-not-allowed opacity-60" : ""} ${className}`}>
            <div className="relative w-5 h-5">
                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-5 h-5 appearance-none cursor-pointer dark:border-gray-700 border border-gray-300 checked:border-transparent rounded-md checked:bg-brand-500 disabled:opacity-60"
                    disabled={disabled}
                />
                {checked && (
                    <svg viewBox="0 0 20 20" fill="none" className="absolute inset-0 m-auto h-5 w-5 text-white">
                        <path d="M6 10.5L8.5 13L14 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>
            {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
        </label>
    );
}

export default Checkbox;
