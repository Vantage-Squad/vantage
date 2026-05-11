import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import InputField, { type InputFieldProps } from "./InputField";

interface PasswordInputProps extends Omit<InputFieldProps, "icon" | "type"> {
    hideToggle?: boolean;
}

const PasswordInput = ({ hideToggle, disabled, ...props }: PasswordInputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleIcon = showPassword ? (
        <EyeOff 
            className="w-4 h-4 cursor-pointer hover:text-gray-300 transition-colors" 
            onClick={() => !disabled && setShowPassword(false)}
        />
    ) : (
        <Eye 
            className="w-4 h-4 cursor-pointer hover:text-gray-300 transition-colors" 
            onClick={() => !disabled && setShowPassword(true)}
        />
    );

    return (
        <InputField 
            type={showPassword ? "text" : "password"}
            icon={hideToggle ? undefined : toggleIcon}
            disabled={disabled}
            {...props}
        />
    );
};

export default PasswordInput;
