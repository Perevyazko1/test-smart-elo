import cls from './AppSwitch.module.scss';
import {ChangeEvent} from "react";

interface AppSwitchProps {
    checked: boolean;
    onSwitch: (value: boolean) => void;
    label?: string;
}

export const AppSwitch = (props: AppSwitchProps) => {
    const {onSwitch, label, checked} = props;
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        onSwitch(event.target.checked);
    };

    return (
        <div className={cls.switchContainer}>
            <div className={cls.switchWrapper}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={handleInputChange}
                    className={cls.switchInput}
                    id="switch-component"
                />
                <label htmlFor="switch-component" className={cls.switchLabel}></label>
            </div>
            <span className={cls.switchText}>{label}</span>
        </div>
    );
};
