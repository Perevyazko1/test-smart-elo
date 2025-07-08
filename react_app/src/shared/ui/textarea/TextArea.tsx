import {type ChangeEvent, type InputHTMLAttributes, useLayoutEffect, useRef} from "react";
import {twMerge} from "tailwind-merge";

interface TextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {

}

export const TextArea = (props: TextAreaProps) => {
    const {className, onInput, value, ...otherProps} = props;

    const internalRef = useRef<HTMLTextAreaElement>(null);
    const adjustHeight = (element: HTMLTextAreaElement | null) => {
        if (element) {
            element.style.height = 'auto';
            element.style.height = `${element.scrollHeight}px`;
        }
    };

    useLayoutEffect(() => {
        adjustHeight(internalRef.current);
    }, [value]);

    const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
        adjustHeight(event.currentTarget);
        if (onInput) {
            onInput(event);
        }
    };

    return (
        <textarea
            ref={internalRef}
            onInput={handleInput}
            rows={1}
            className={twMerge([
                'outline-0 border-0',
                className
            ])}
            {...otherProps}
        />
    );
};