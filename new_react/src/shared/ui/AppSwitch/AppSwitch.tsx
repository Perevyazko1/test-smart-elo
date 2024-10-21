import cls from './AppSwitch.module.scss';
import {ChangeEvent, HTMLAttributes, ReactNode, useId, useMemo} from "react";
import classNames from "classnames";

interface AppSwitchProps extends HTMLAttributes<HTMLDivElement> {
    checked: boolean;
    disabled?: boolean;
    onSwitch: (value: boolean) => void;
    label?: string;
    handleContent?: ReactNode;
    labelPosition?: 'labelRight' | 'labelBottom';
}

export const AppSwitch = (props: AppSwitchProps) => {
    const {onSwitch, label, checked, disabled = false, labelPosition = 'labelRight', handleContent, ...otherProps} = props;
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        onSwitch(event.target.checked);
    };

    const id: string = useId();

    const inputId = useMemo(() => {
        const date: string = new Date().toISOString();
        return id + date;
    }, [id]);

    return (
        <div {...otherProps}>
            <div className={classNames(cls.switchContainer, cls[labelPosition])}>
                <div className={cls.switchWrapper}>
                    <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={handleInputChange}
                        className={cls.switchInput}
                        id={inputId}
                    />
                    <label
                        htmlFor={inputId}
                        className={cls.switchLabel}
                    >
                        <span className={cls.switchHandle}>
                            {handleContent || ""}
                        </span>
                    </label>
                </div>
                {label ? <label className={cls.switchText} htmlFor={inputId}>{label}</label> : null}
            </div>
        </div>
    );
};
