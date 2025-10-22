import {type ChangeEvent, type InputHTMLAttributes, useRef} from "react";
import {twMerge} from "tailwind-merge";
import {Controller, useFormContext} from "react-hook-form";

interface TextAreaFormProps extends Omit<InputHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange' | 'name'> {
    name: string;
    rows?: number;
}

export const TextAreaForm = (props: TextAreaFormProps) => {
    const {className, onInput, name, ...otherProps} = props;
    const {control} = useFormContext();

    const internalRef = useRef<HTMLTextAreaElement>(null);
    const adjustHeight = (element: HTMLTextAreaElement | null) => {
        if (element) {
            element.style.height = 'auto';
            element.style.height = `${element.scrollHeight}px`;
        }
    };

    const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
        adjustHeight(event.currentTarget);
        if (onInput) {
            onInput(event);
        }
    };

    return (
        <Controller
            name={name}
            control={control}
            render={({field: {onChange, onBlur, value, ref}}) => (
                <textarea
                    ref={(e) => {
                        ref(e);
                        internalRef.current = e;
                    }}
                    rows={2}
                    value={value || ''}
                    onChange={(e) => {
                        handleInput(e);
                        onChange(e);
                    }}
                    onBlur={onBlur}
                    className={twMerge([
                        'outline-0 border-0',
                        className
                    ])}
                    {...otherProps}
                />
            )}
        />
    );
};