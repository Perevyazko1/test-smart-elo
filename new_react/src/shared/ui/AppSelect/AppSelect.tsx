import {ChangeEvent, HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState} from "react";

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClearIcon from '@mui/icons-material/Clear';

import classNames from 'classnames';

import cls from './AppSelect.module.scss';


interface AppSelectBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
    colorScheme: 'lightInput' | 'darkInput';
    readonly?: boolean;
    label?: string;
}

interface AppSelectAnyOptionProps<T> extends AppSelectBaseProps {
    variant: 'select';
    value: T | null;
    options?: T[];
    onSelect?: (option: T | null) => void;
    getOptionLabel?: (option: T | null) => string;
}

interface AppDropdownAnyOptionProps<T> extends AppSelectBaseProps {
    variant: 'dropdown';
    value: T;
    options?: T[];
    onSelect?: (option: T) => void;
    getOptionLabel?: (option: T) => string;
}

// interface AppMultipleOptionProps<T> extends AppSelectBaseProps {
//     variant: 'multiple';
//     value?: T extends string ? string[] : T[];
//     options?: T[];
//     onSelect?: (options: T[]) => void;
//     getOptionLabel?: T extends string ? never : (option: T) => string;
// }


type AppSelectProps<T> =
    AppDropdownAnyOptionProps<T> |
    AppSelectAnyOptionProps<T>
// | AppMultipleOptionProps<T>;


export const AppSelect = <T, >(props: AppSelectProps<T>) => {
    const {
        value,
        variant,
        label,
        options,
        colorScheme,
        onSelect,
        getOptionLabel,
        readonly = false,
        className,
        ...divProps
    } = props;

    const getStringOptionValue = useCallback((option: T | null | string): string => {
        if (typeof option === 'string') {
            return option;
        } else if (getOptionLabel && option) {
            return getOptionLabel(option);
        } else {
            return "";
        }
    }, [getOptionLabel]);

    const [filter, setFilter] = useState<string>(getStringOptionValue(value));

    const [showOptions, setShowOptions] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const inputNotEqualValue = useMemo(() => {
        if (typeof value === 'string') {
            return value !== filter;
        }
        if (getOptionLabel && value) {
            console.log(getOptionLabel(value), filter, getOptionLabel(value) !== filter)
            return getOptionLabel(value) !== filter;
        }
        return false;
    }, [filter, getOptionLabel, value]);

    const handleClean = useCallback(() => {
        if (variant === 'dropdown') {
            setFilter(getStringOptionValue(value));
        }
        if (variant === 'select') {
            setFilter("");
        }
    }, [getStringOptionValue, value, variant]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowOptions(false);
                if (inputNotEqualValue) {
                    handleClean();
                }
            }
        };
        if (showOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [getOptionLabel, getStringOptionValue, handleClean, inputNotEqualValue, showOptions, value]);

    const toggleOptions = () => {
        setShowOptions(prev => !prev);
    };

    const renderOptionLabel = useCallback((option: T) => {
        if (getOptionLabel) {
            return getOptionLabel(option);
        }
        if (typeof value === 'string') {
            return value;
        }

        return '';
    }, [getOptionLabel, value]);

    const handleSelect = (option: T | null) => {
        if (onSelect && variant === 'dropdown' && option) {
            onSelect(option);
            setFilter(getStringOptionValue(option));
        }
        if (onSelect && variant === 'select') {
            onSelect(option);
            setFilter(getStringOptionValue(option));
        }
        setShowOptions(false);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFilter(e.target.value || "");
        setShowOptions(true);
    };

    const filteredOptions = useMemo(() => {
        if (options && inputNotEqualValue) {
            return options.filter(option => {
                if (typeof option === 'string') {
                    return option.toLowerCase().includes(filter.toLowerCase());
                }
                if (!getOptionLabel) {
                    return false;
                }
                return getOptionLabel(option).toLowerCase().includes(filter.toLowerCase());
            });
        }
        return options || [];
    }, [options, inputNotEqualValue, getOptionLabel, filter]);

    const inputDisabled = useMemo(() => {
        if (readonly) {
            return true;
        }
        return false;
    }, [readonly]);

    const showCleanBtn = useMemo(() => {
        if (variant === 'select') {
            return showOptions || inputNotEqualValue;
        }
        if (variant === "dropdown") {
            return inputNotEqualValue;
        }
        return false;
    }, [inputNotEqualValue, showOptions, variant]);

    return (
        <div {...divProps} ref={containerRef} className={classNames(cls.MainContainer, className)}>
            <div
                className={classNames(cls.InputContainer, cls[colorScheme])}
                onClick={toggleOptions}
            >
                {label &&
                    <label className={classNames(
                        cls.Label,
                        cls[colorScheme],
                        {[cls.Active]: showOptions || filter}
                    )}>
                        {label}
                    </label>
                }
                <input
                    value={filter}
                    onChange={handleInputChange}
                    readOnly={inputDisabled}
                    className={classNames(
                        cls.Input,
                        cls[colorScheme],
                        {[cls.Active]: showOptions}
                    )}
                />
                <button
                    className={classNames(
                        cls.IconBtn,
                        cls[colorScheme],
                        cls.ClearBtn,
                        {[cls.Show]: showCleanBtn}
                    )}
                    onClick={handleClean}
                >
                    <ClearIcon
                        fontSize={'small'}
                    />
                </button>

                <button className={classNames(
                    cls.IconBtn,
                    cls[colorScheme],
                    cls.DropdownBtn
                )}>
                    <ArrowDropDownIcon
                        className={classNames(
                            cls.DropdownIconStyle,
                            {[cls.flipActive]: showOptions}
                        )}
                    />
                </button>
            </div>

            {showOptions && filteredOptions.length > 0 && (
                <div className={classNames(cls.OptionsContainer, cls[colorScheme])}>
                    {filteredOptions.map((option, index) => (
                        <div
                            key={index}
                            onClick={() => handleSelect(option)}
                            className={classNames(cls.Option, cls[colorScheme])}
                        >
                            {renderOptionLabel(option)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
