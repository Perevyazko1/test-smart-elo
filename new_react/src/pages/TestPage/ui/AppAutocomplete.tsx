import {Autocomplete, TextField} from "@mui/material";
import {styled} from "@mui/material/styles";

interface StyledAutocompleteProps {
    colorScheme: 'dark' | 'light';
}

const StyledAutocompleteWrapper = styled('div')<StyledAutocompleteProps>(({colorScheme}) => ({
    backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff',
    margin: '4px 0 0 1px',
    '& .MuiAutocomplete-popper': {
        '& .MuiAutocomplete-listbox': {
            backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff', // Цвет заднего фона поппера
            color: colorScheme === 'dark' ? '#ffffff' : '#000000',
            '& .MuiAutocomplete-option[data-focus="true"]': {
                backgroundColor: colorScheme === 'dark' ? '#333333' : '#e0e0e0', // Цвет фона для выбранного элемента
                color: colorScheme === 'dark' ? '#ffffff' : '#000000',
            },
            '& .MuiAutocomplete-option[aria-selected="true"]': {
                backgroundColor: colorScheme === 'dark' ? '#555555' : '#d3d3d3', // Цвет фона для элемента при фокусе
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
        borderBottom: `1px solid ${colorScheme === 'dark' ? '#ffffff' : '#000000'}`,
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
        color: colorScheme === 'dark' ? '#ffffff' : '#000000',
        transform: 'translate(0, 8px) scale(1)',
    },
    '& .MuiInputLabel-shrink': {
        transform: 'translate(0, -1.5px) scale(0.75)',
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
        backgroundColor: colorScheme === 'dark' ? '#444444' : '#e0e0e0',
        color: colorScheme === 'dark' ? '#ffffff' : '#000000',
        '& .MuiChip-deleteIcon': {
            color: colorScheme === 'dark' ? '#ffffff' : '#000000',
        },
    },
    '& .MuiAutocomplete-tag': {
        maxWidth: 'calc(100% - 24px)',
    }
}));

interface AppAutocompleteProps {
    variant: 'dark' | 'light';
}


export const AppAutocomplete = (props: AppAutocompleteProps) => {
    const {variant} = props;
    const top100Films = ['Конструктора', 'Обивка', 'Крой', "Пошив", "ППУ"];

    return (
        <StyledAutocompleteWrapper colorScheme={variant}>

            <StyledAutocomplete
                colorScheme={props.variant}
                size="small"
                options={top100Films}
                disablePortal={true}
                multiple
                limitTags={1}
                sx={{
                    width: 220,
                }}
                renderInput={(params) => (
                    <StyledTextField
                        {...params}
                        colorScheme={variant}
                        variant="standard"
                        label="Отдел"
                    />
                )}
            />
        </StyledAutocompleteWrapper>
    );
};
