import {HTMLAttributes, useEffect, useRef, useState} from "react";

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClearIcon from '@mui/icons-material/Clear';

import classNames from 'classnames';

import cls from './AppSelect.module.scss';


interface AppSelectBaseProps extends HTMLAttributes<HTMLDivElement> {
    colorScheme: 'lightInput' | 'darkInput';
}

interface AppSelectProps<T> extends AppSelectBaseProps {
    options?: T[];
    getOptionLabel?: (option: T) => string;
}


export const AppSelect = <T, >(props: AppSelectProps<T>) => {
    const {options, colorScheme, ...divProps} = props;

    const [showOptions, setShowOptions] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setShowOptions(false);
        }
    };

    useEffect(() => {
        if (showOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptions]);

    const toggleOptions = () => {
        setShowOptions(prev => !prev);
    };

    return (
        <div {...divProps} ref={containerRef}>
            <div
                className={classNames(cls.InputContainer, cls[colorScheme])}
                onClick={toggleOptions}
            >
                <input
                    className={classNames(cls.Input, cls[colorScheme])}
                    value={'Какой-то текст asdf asdf asdf asd '}
                />
                <ArrowDropDownIcon
                    className={classNames(
                        cls.DropdownIconStyle,
                        cls[colorScheme],
                        {[cls.flipActive]: showOptions}
                    )}

                />
                <ClearIcon
                    fontSize={'small'}
                    className={classNames(cls.ClearIconStyle, cls[colorScheme])}
                    sx={{
                        display: showOptions ? 'block' : 'none'
                    }}
                />
            </div>
        </div>
    );
};
