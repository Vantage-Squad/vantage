import { useState, type InputHTMLAttributes } from "react";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: boolean;
    icon?: React.ReactNode;
}

const InputField = ({ label, error, icon, disabled, ...props }: InputFieldProps) => {
    const [isFocused, setIsFocused] = useState(false);

    const baseBorder = error ? "var(--color-status-danger)" : "var(--color-border-subtle)";
    const focusBorder = error ? "var(--color-status-danger)" : "var(--color-border-emphasis)";
    
    // The instructions say "box-shadow 0 0 0 3px rgba(79,156,249,0.12)" for focus
    const focusShadow = isFocused && !error ? "0 0 0 3px rgba(79,156,249,0.12)" : "none";
    
    const bgTint = error ? "rgba(239,68,68,0.06)" : "var(--color-bg-raised)";

    return (
        <div className="flex flex-col mb-4">
            <div className="flex justify-between items-center mb-1">
                <label 
                    className="uppercase font-medium" 
                    style={{ 
                        color: "var(--color-text-secondary)", 
                        fontSize: "10px", 
                        letterSpacing: "0.05em" 
                    }}
                >
                    {label}
                </label>
            </div>
            
            <div 
                className={`flex items-center transition-all duration-150 rounded-md overflow-hidden ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                style={{
                    backgroundColor: bgTint,
                    border: `1px solid ${isFocused ? focusBorder : baseBorder}`,
                    boxShadow: focusShadow,
                }}
            >
                <input 
                    className="flex-grow bg-transparent outline-none px-3 py-2 w-full"
                    style={{ 
                        color: "var(--color-text-primary)",
                        fontSize: "var(--font-size-body)",
                    }}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    disabled={disabled}
                    {...props}
                />
                {icon && (
                    <div className="px-3 flex items-center justify-center text-gray-500" style={{ color: "var(--color-text-muted)" }}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InputField;
