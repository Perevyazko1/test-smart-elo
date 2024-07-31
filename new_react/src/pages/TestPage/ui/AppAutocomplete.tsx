import {HTMLAttributes, ReactNode} from "react";
import {Autocomplete, TextField} from "@mui/material";
import {styled} from "@mui/material/styles";


interface StyledAutocompleteProps {
    colorscheme: 'dark' | 'light';
}

const StyledAutocompleteWrapper = styled('div')<StyledAutocompleteProps>(({colorscheme}) => ({
    backgroundColor: colorscheme === 'dark' ? '#000000' : 'inherit',
    padding: '10px 0 2px 0',
    margin: '2px 0 0 1px',
    '& .MuiAutocomplete-popper': {
        '& .MuiAutocomplete-listbox': {
            backgroundColor: colorscheme === 'dark' ? '#000000' : '#ffffff', // Цвет заднего фона поппера
            color: colorscheme === 'dark' ? '#ffffff' : '#000000',

            '& .MuiAutocomplete-option[data-focus="true"]': {
                backgroundColor: colorscheme === 'dark' ? '#333333' : '#e0e0e0', // Цвет фона для выбранного элемента
                color: colorscheme === 'dark' ? '#ffffff' : '#000000',
            },
            '& .MuiAutocomplete-option[aria-selected="true"]': {
                backgroundColor: colorscheme === 'dark' ? '#555555' : '#d3d3d3', // Цвет фона для элемента при фокусе
                color: colorscheme === 'dark' ? '#ffffff' : '#000000',
            },
        },
    },
    '& .MuiAutocomplete-groupLabel': {
        backgroundColor: colorscheme === 'dark' ? '#262626' : '#ffffff', // Цвет заднего фона поппера
        color: colorscheme === 'dark' ? '#ffffff' : '#000000',
    }
}));

const StyledTextField = styled(TextField)<StyledAutocompleteProps>(({colorscheme}) => ({
    "& .MuiInputBase-root::after": {
        borderBottom: '2px solid #1976d2',
        left: 0,
        bottom: 0,
        content: "''",
        position: 'absolute',
        right: 0,
        transform: 'scaleX(0)',
        transition: 'transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
        pointerEvents: 'none',
    },
    "&:hover .MuiInputBase-root::after": {
        transform: 'scaleX(1)',
    },
    "& .MuiInputBase-root::before": {
        borderBottom: `1px solid ${colorscheme === 'dark' ? '#ffffff' : '#2c2c2c'}`,
        left: 0,
        bottom: 0,
        position: 'absolute',
        right: 0,
        transition: 'border - bottom - color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        pointerEvents: 'none',
    },
    '&.Mui-focused fieldset': {
        borderColor: colorscheme === 'dark' ? '#ffffff' : '#000000', // цвет границы подводки в фокусе
    },
    "& .MuiInputBase-input": {
        padding: '0 !important', // Отступ внутри инпута
        minWidth: '0 !important',
        margin: '0 !important',
    },
}));

const StyledAutocomplete = styled(Autocomplete)<StyledAutocompleteProps>(({colorscheme}) => ({
    fontFamily: "'Montserrat', Arial, sans-serif !important",
    // базовый инпут
    '& .MuiInputBase-root': {
        minWidth: '0',
        fontSize: '14px',
        lineHeight: 0.8,
        padding: '0',
        margin: '0',
        color: colorscheme === 'dark' ? '#ececec' : '#000000',
    },
    '& .MuiAutocomplete-inputRoot': {
        padding: '0 0 0 4px',
    },
    // label к инпуту
    '& .MuiInputLabel-root': {
        zIndex: '1000',
        fontSize: '10px',
        lineHeight: '1',
        top: '-2px',
        color: colorscheme === 'dark' ? 'var(--bs-secondary-color)' : 'var(--bs-secondary-color)',
        transform: 'translate(0, 4px) scale(1)',
    },
    '& .MuiInputLabel-shrink': {
        color: 'var(--bs-secondary-color)',
        transform: 'translate(0, -10px) scale(1)',
    },
    // кнопки
    "& .MuiAutocomplete-popupIndicator": {
        color: colorscheme === 'dark' ? '#ffffff' : '#000000',
    },
    "& .MuiAutocomplete-clearIndicator": {
        color: colorscheme === 'dark' ? '#ffffff' : '#000000',
    },
    // стиль выбранных элементов в инпуте
    '& .MuiChip-root': {
        backgroundColor: colorscheme === 'dark' ? '#252525' : '#d0d0d0',
        color: colorscheme === 'dark' ? '#c9c9c9' : '#000000',
        '& .MuiChip-deleteIcon': {
            color: colorscheme === 'dark' ? '#000000' : '#000000',
        },
        height: '19px',
        padding: '0',
        fontSize: '12px',
        lineHeight: '0.8',
        margin: '0 0 1px 0'
    },
    '& .MuiAutocomplete-tag': {
        maxWidth: 'calc(100% - 24px)',
    }
}));


interface AppAutocompleteBaseProps<T> extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    colorscheme?: 'dark' | 'light';
    label: string;
    options?: T[];
    loading?: boolean;
    getOptionLabel?: (option: T) => string;
    width?: number;
    groupBy?: (option: T) => string;
    readOnly?: boolean;
    limitHeight?: boolean;
    limitTags?: number;
    required?: boolean;
    renderOption?: (props: HTMLAttributes<HTMLLIElement>, option: T, selected: boolean) => ReactNode;
}

interface AppAutocompleteMultipleProps<T> extends AppAutocompleteBaseProps<T> {
    variant: 'multiple';
    value: T[] | null;
    onChangeClb?: (newValue: T[] | null) => void;
}

interface AppAutocompleteSelectProps<T> extends AppAutocompleteBaseProps<T> {
    variant: 'select';
    value: T | null;
    onChangeClb?: (newValue: T | null) => void;
}

interface AppAutocompleteDropdownProps<T> extends AppAutocompleteBaseProps<T> {
    variant: 'dropdown';
    value: T;
    onChangeClb?: (newValue: T) => void;
}

type AppAutocompleteProps<T> =
    AppAutocompleteMultipleProps<T>
    | AppAutocompleteSelectProps<T>
    | AppAutocompleteDropdownProps<T>;

export const AppAutocomplete = <T, >(props: AppAutocompleteProps<T>) => {
    const {
        colorscheme = 'light',
        variant,
        getOptionLabel,
        loading,
        onChangeClb,
        label,
        options,
        value,
        width,
        groupBy,
        readOnly = false,
        limitHeight = false,
        limitTags = 1,
        className,
        required = false,
        renderOption,
        ...otherProps
    } = props;

    const extendsSx = readOnly ? {
        "& .MuiAutocomplete-popupIndicator": {
            display: "none",
        },
        "& .MuiAutocomplete-clearIndicator": {
            display: "none",
        },
    } : variant === 'dropdown' ?
        {
            "& .MuiAutocomplete-clearIndicator": {
                display: "none",
            },
        }
        : {};

    const extendDivSx = limitHeight ? {
        maxHeight: '36px',
        overflowY: 'auto',
        overflowX: 'hidden',
    } : {};

    return (
        <div className={'d-flex align-items-end align-self-start ' + className} {...otherProps}>
            <StyledAutocompleteWrapper colorscheme={colorscheme} sx={extendDivSx} className={'flex-fill'}>
                <StyledAutocomplete
                    readOnly={readOnly}
                    colorscheme={colorscheme}
                    size="small"
                    options={options || []}
                    getOptionLabel={getOptionLabel ? (option) => getOptionLabel(option as T) : undefined}
                    disablePortal={true}
                    multiple={variant === 'multiple'}
                    limitTags={limitTags}
                    value={value}
                    loading={loading}
                    groupBy={groupBy ? (option) => groupBy(option as T) : undefined}
                    renderOption={renderOption ?
                        (props, option, {selected}) => renderOption(props, option as T, selected) :
                        undefined
                    }
                    sx={{
                        width: width,
                        ...extendsSx,
                    }}
                    onChange={onChangeClb ? (e, newValue) => onChangeClb(newValue as (T[] & T) | (null & T)) : undefined}
                    renderInput={(params) => (
                        <StyledTextField
                            {...params}
                            colorscheme={colorscheme}
                            variant="standard"
                            required={required}
                            label={label}
                        />
                    )}
                />
            </StyledAutocompleteWrapper>
        </div>
    );
};
