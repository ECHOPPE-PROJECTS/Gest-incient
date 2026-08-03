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
                <input type="checkbox" id={id} className="w-5 h-5 appearance-none cursor-pointer dark:border-gray-700 border border-gray-300 checked:border-transparent rounded-md checked:bg-brand-500 disabled:opacity-60"/>
                {checked &&(
                    <svg>
                        <path/>
                    </svg>
                )}
            </div>
            {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
        </label>
    );
}

export default Checkbox;
