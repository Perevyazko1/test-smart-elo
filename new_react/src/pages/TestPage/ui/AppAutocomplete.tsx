import {HTMLAttributes} from "react";
import {Autocomplete, TextField} from "@mui/material";
import {styled} from "@mui/material/styles";

interface StyledAutocompleteProps {
    colorScheme: 'dark' | 'light';
}

const StyledAutocompleteWrapper = styled('div')<StyledAutocompleteProps>(({colorScheme}) => ({
    backgroundColor: colorScheme === 'dark' ? '#000000' : 'inherit',
    padding: '10px 0 2px 0',
    margin: '2px 0 0 1px',
    '& .MuiAutocomplete-popper': {
        '& .MuiAutocomplete-listbox': {
            // backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff', // Цвет заднего фона поппера
            color: colorScheme === 'dark' ? '#ffffff' : '#000000',
            '& .MuiAutocomplete-option[data-focus="true"]': {
                // backgroundColor: colorScheme === 'dark' ? '#333333' : '#e0e0e0', // Цвет фона для выбранного элемента
                color: colorScheme === 'dark' ? '#ffffff' : '#000000',
            },
            '& .MuiAutocomplete-option[aria-selected="true"]': {
                // backgroundColor: colorScheme === 'dark' ? '#555555' : '#d3d3d3', // Цвет фона для элемента при фокусе
                color: colorScheme === 'dark' ? '#ffffff' : '#000000',
            },
        },
    },
}));

const StyledTextField = styled(TextField)<StyledAutocompleteProps>(({colorScheme}) => ({
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
        borderBottom: `1px solid ${colorScheme === 'dark' ? '#ffffff' : '#575757'}`,
        left: 0,
        bottom: 0,
        position: 'absolute',
        right: 0,
        transition: 'border - bottom - color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        pointerEvents: 'none',
    },
    '&.Mui-focused fieldset': {
        borderColor: colorScheme === 'dark' ? '#ffffff' : '#000000', // цвет границы подводки в фокусе
    },
    "& .MuiInputBase-input": {
        padding: '0 !important', // Отступ внутри инпута
        minWidth: '0 !important',
        margin: '0 !important',
    },
}));

const StyledAutocomplete = styled(Autocomplete)<StyledAutocompleteProps>(({colorScheme}) => ({
    fontFamily: "'Montserrat', Arial, sans-serif !important",
    // базовый инпут
    '& .MuiInputBase-root': {
        minWidth: '0',
        fontSize: '16px',
        padding: '0',
        margin: '0',
        color: colorScheme === 'dark' ? '#ffffff' : '#000000',
    },
    '& .MuiAutocomplete-inputRoot': {
        padding: '0 0 0 4px',
    },
    // label к инпуту
    '& .MuiInputLabel-root': {
        zIndex: '1000',
        fontSize: '12px',
        lineHeight: '1',
        top: '-2px',
        color: colorScheme === 'dark' ? '#ffffff' : 'var(--bs-secondary-color)',
        transform: 'translate(0, 8px) scale(1)',
    },
    '& .MuiInputLabel-shrink': {
        color: 'var(--bs-secondary-color)',
        transform: 'translate(0, -12px) scale(1)',
    },
    // кнопки
    "& .MuiAutocomplete-popupIndicator": {
        color: colorScheme === 'dark' ? '#ffffff' : '#000000',
    },
    "& .MuiAutocomplete-clearIndicator": {
        color: colorScheme === 'dark' ? '#ffffff' : '#000000',
    },
    // стиль выбранных элементов в инпуте
    '& .MuiChip-root': {
        // fontSize: '12px',
        backgroundColor: colorScheme === 'dark' ? '#343434' : '#d0d0d0',
        color: colorScheme === 'dark' ? '#000000' : '#000000',
        '& .MuiChip-deleteIcon': {
            color: colorScheme === 'dark' ? '#000000' : '#000000',
        },
    },
    '& .MuiAutocomplete-tag': {
        maxWidth: 'calc(100% - 24px)',
    }
}));

interface AppAutocompleteBaseProps<T> extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    colorScheme?: 'dark' | 'light';
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
        colorScheme = 'light',
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
        <div className={'d-flex align-items-end pb-1 align-self-stretch ' + className} {...otherProps}>
            <StyledAutocompleteWrapper colorScheme={colorScheme} sx={extendDivSx} className={'flex-fill'}>
                <StyledAutocomplete
                    readOnly={readOnly}
                    colorScheme={colorScheme}
                    size="small"
                    options={options || []}
                    getOptionLabel={getOptionLabel ? (option) => getOptionLabel(option as T) : undefined}
                    disablePortal={true}
                    multiple={variant === 'multiple'}
                    limitTags={limitTags}
                    value={value}
                    loading={loading}
                    groupBy={groupBy ? (option) => groupBy(option as T) : undefined}
                    sx={{
                        width: width,
                        ...extendsSx,
                    }}
                    onChange={onChangeClb ? (e, newValue) => onChangeClb(newValue as (T[] & T) | (null & T)) : undefined}
                    renderInput={(params) => (
                        <StyledTextField
                            {...params}
                            colorScheme={colorScheme}
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
