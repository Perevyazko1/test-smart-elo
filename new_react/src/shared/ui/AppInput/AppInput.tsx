import {InputHTMLAttributes, ReactNode} from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement>{
    className?: string;
    children?: ReactNode;
}


export const AppInput = (props: InputProps) => {
    const {
        className,
        children,
        ...otherProps
    } = props;


    return (
        <input
            className={"form-control fw-bold form-control-sm my-auto"}
            {...otherProps}
        >
            {children}
        </input>
    );
};