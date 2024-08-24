import React, {
    ChangeEvent,
    HTMLAttributes,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClearIcon from '@mui/icons-material/Clear';

import classNames from 'classnames';

import cls from './AppSelect.module.scss';
import {Spinner} from "react-bootstrap";
import {AppSelectMenu, GetRenderOptionProps} from "./AppSelectMenu";


interface AppSelectBaseProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
    noInput?: boolean;
    colorScheme: 'lightInput' | 'darkInput';
    isLoading?: boolean;
    bordered?: boolean;
    label?: string;
    readOnly?: boolean;
    required?: boolean;
    getOptionLabel?: (option: T) => string;
    getRenderOption?: (props: GetRenderOptionProps<T>) => ReactNode;
}

interface AppSelectOptionProps<T> extends AppSelectBaseProps<T> {
    variant: 'select';
    value: T | null;
    options?: T[];
    onSelect?: (option: T | null) => void;
}

interface AppDropdownOptionProps<T> extends AppSelectBaseProps<T> {
    variant: 'dropdown';
    value: T;
    options?: T[];
    onSelect?: (option: T) => void;
}

interface AppMultipleOptionProps<T> extends AppSelectBaseProps<T> {
    variant: 'multiple';
    value: T[];
    options?: T[];
    onSelect?: (options: T[]) => void;
}


type AppSelectProps<T> =
    AppMultipleOptionProps<T> |
    AppDropdownOptionProps<T> |
    AppSelectOptionProps<T>;


export const AppSelect = <T, >(props: AppSelectProps<T>) => {
    const {
        value,
        required,
        noInput,
        isLoading,
        bordered = false,
        variant,
        label,
        options,
        colorScheme,
        onSelect,
        getOptionLabel,
        readOnly = false,
        className,
        children,
        getRenderOption,
        ...divProps
    } = props;

    const getStringOptionValue = useCallback((option: T | null): string => {
        if (typeof option === 'string' && !getOptionLabel) {
            return option;
        } else if (getOptionLabel && option) {
            return getOptionLabel(option);
        } else {
            return "";
        }
    }, [getOptionLabel]);

    const stringValue = useMemo(() => {
        if (variant === 'multiple') {
            return value.map(getStringOptionValue).join(', ');
        } else {
            return getStringOptionValue(value);
        }
    }, [getStringOptionValue, value, variant]);

    const [inputValue, setInputValue] = useState<string>(stringValue);
    const [spanValue, setSpanValue] = useState<string>(stringValue);

    const containerRef = useRef<HTMLDivElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const inputNotEqualValue = useMemo(() => {
        return stringValue !== inputValue;
    }, [inputValue, stringValue]);

    const toggleOptions = (event: React.MouseEvent<HTMLElement>) => {
        if (!readOnly) {
            setAnchorEl(anchorEl ? null : event.currentTarget);
        }
    };

    const isSelected = useCallback((option: T) => {
        if (variant === 'multiple') {
            return value.some(item => getStringOptionValue(item) === getStringOptionValue(option));
        }
        return getStringOptionValue(value) === getStringOptionValue(option);
    }, [getStringOptionValue, value, variant]);

    const handleSelect = useCallback((option: T | null) => {
        if (variant === 'multiple' && option) {
            const newValue = isSelected(option)
                ? value.filter(v => getStringOptionValue(v) !== getStringOptionValue(option))
                : [...value, option];
            onSelect?.(newValue);
            setInputValue('');
        } else if (onSelect && variant === 'dropdown' && option) {
            onSelect(option);
            setInputValue(getStringOptionValue(option));
            setSpanValue(getStringOptionValue(option));
        } else if (onSelect && variant === 'select') {
            onSelect(option);
            setInputValue("");
            setSpanValue(stringValue);
        }
        setAnchorEl(null);
    }, [getStringOptionValue, isSelected, onSelect, stringValue, value, variant]);

    const handleClean = useCallback(() => {
        if (variant === 'dropdown') {
            setInputValue(getStringOptionValue(value));
            setSpanValue(getStringOptionValue(value));
        }
        if (variant === 'select') {
            handleSelect(null);
        }
        if (variant === 'multiple' && onSelect) {
            onSelect([]);
        }
    }, [getStringOptionValue, handleSelect, onSelect, value, variant]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value || "");
    };

    const filteredOptions = useMemo(() => {
        if (options && inputNotEqualValue) {
            return options.filter(option => {
                if (typeof option === 'string') {
                    if (getOptionLabel) {
                        return getOptionLabel(option).toLowerCase().includes(inputValue.toLowerCase());
                    }
                    return option.toLowerCase().includes(inputValue.toLowerCase());
                }
                if (!getOptionLabel) {
                    return false;
                }
                return getOptionLabel(option).toLowerCase().includes(inputValue.toLowerCase());
            });
        }
        return options || [];
    }, [options, inputNotEqualValue, getOptionLabel, inputValue]);

    const sortedOptions = useMemo(() => {
        const selectedOptions = value instanceof Array
            ? value.filter(option => filteredOptions.includes(option)) // Проверка наличия в options
            : value && filteredOptions.includes(value) ? [value] : [];

        const unselectedOptions = filteredOptions.filter(
            option => !isSelected(option)
        );

        return [...selectedOptions, ...unselectedOptions];
    }, [filteredOptions, isSelected, value]);

    const inputDisabled = useMemo(() => {
        if (readOnly || noInput) {
            return true;
        }
        return false;
    }, [noInput, readOnly]);

    const hideCleanBtn = useMemo(() => {
        if (readOnly || !options) {
            return true;
        }
        if (variant === 'select') {
            return false;
        }
        if (variant === "dropdown") {
            return !inputNotEqualValue;
        }
        if (variant === 'multiple') {
            return value.length === 0;
        }
        return true;
    }, [inputNotEqualValue, options, readOnly, value, variant]);

    useEffect(() => {
        if (variant !== 'multiple') {
            setInputValue(stringValue);
            setSpanValue(stringValue);
        } else {
            setSpanValue(stringValue);
        }
    }, [stringValue, variant]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {

                setAnchorEl(null);
                if (inputNotEqualValue && variant !== "multiple") {
                    handleClean();
                } else if (variant === "multiple") {
                    setInputValue("");
                }
            }
        };
        if (anchorEl) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [anchorEl, getOptionLabel, getStringOptionValue, handleClean, inputNotEqualValue, value, variant]);

    return (
        <div {...divProps} ref={containerRef} className={classNames(cls.MainContainer, className)}>
            <div
                className={classNames(
                    cls.InputContainer,
                    cls[colorScheme],
                    {[cls.Bordered]: bordered},
                )}
                onClick={(e) => toggleOptions(e)}
            >
                {label &&
                    <label className={classNames(
                        cls.Label,
                        cls[colorScheme],
                        {[cls.Active]: !!anchorEl || inputValue || spanValue}
                    )}>
                        {label}
                        {required && <span className={cls.RequiredMarker}>*</span>}
                    </label>
                }
                <input
                    value={inputValue}
                    required={required}
                    onChange={handleInputChange}
                    readOnly={inputDisabled || !options}
                    className={classNames(
                        cls.Input,
                        cls[colorScheme],
                        {[cls.Active]: !!anchorEl},
                    )}
                />
                <span className={classNames(
                    cls.InputPlaceholder,
                    cls[colorScheme],
                    {[cls.Active]: !anchorEl}
                )}>
                    {spanValue}
                </span>
                <button
                    type={'button'}
                    className={classNames(
                        cls.IconBtn,
                        cls[colorScheme],
                        cls.ClearBtn,
                        {[cls.Hide]: hideCleanBtn}
                    )}
                    onClick={handleClean}
                >
                    <ClearIcon
                        fontSize={'small'}
                    />
                </button>

                {isLoading ?
                    <button
                        type={'button'}
                        className={classNames(
                            cls.IconBtn,
                            cls[colorScheme],
                            cls.DropdownBtn,
                        )}
                    >
                        <Spinner
                            size={'sm'}
                            animation={'grow'}
                            className={classNames(
                                cls.DropdownIconStyle,
                                {[cls.flipActive]: !!anchorEl}
                            )}/>
                    </button> :
                    <button
                        type={'button'}
                        className={classNames(
                            cls.IconBtn,
                            cls[colorScheme],
                            cls.DropdownBtn,
                            {[cls.Hide]: readOnly},
                        )}
                    >
                        <ArrowDropDownIcon
                            className={classNames(
                                cls.DropdownIconStyle,
                                {[cls.flipActive]: !!anchorEl}
                            )}
                        />
                    </button>
                }
            </div>

            <AppSelectMenu
                isSelected={isSelected}
                getStringOptionValue={getStringOptionValue}
                getRenderOption={getRenderOption}
                isLoading={isLoading}
                handleSelect={handleSelect}
                sortedOptions={sortedOptions}
                children={children}
                colorScheme={colorScheme}
                anchorEl={anchorEl}
            />
        </div>
    );
};
