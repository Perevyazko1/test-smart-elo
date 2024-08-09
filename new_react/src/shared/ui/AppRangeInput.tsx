import {Input, Slider} from "@mui/material";
import React, {useMemo} from "react";

interface AppRangeInputProps {
    disabled: boolean;
    value: number;
    maxValue: number;
    setValue: (value: number) => void;
}

export const AppRangeInput = (props: AppRangeInputProps) => {
    const {value, maxValue, setValue, disabled} = props;

    const handleSliderChange = (event: Event, newValue: number | number[]) => {
        setValue(newValue as number);
    };

    const incrementValue = (incValue: number) => {
        if (value + incValue > maxValue) {
            setValue(maxValue)
        } else if (value + incValue < 0) {
            setValue(0)
        } else {
            setValue(value + incValue)
        }
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = event.target.value;

        inputValue = inputValue.replace(/^0+/, '');

        // Если значение становится пустым, ставим 0
        if (inputValue === '') {
            inputValue = '0';
        } else if (Number(inputValue) > maxValue) {
            inputValue = String(maxValue)
        } else if (Number(inputValue) <= 0) {
            inputValue = '0';
        }

        setValue(Number(inputValue));
    };

    const inputValue = useMemo(() => {
        let inputValue = String(value).replace(/^0+/, '');

        // Если значение становится пустым, ставим 0
        if (inputValue === '') {
            inputValue = '0';
        }
        return inputValue;
    }, [value])

    return (
        <div className={'d-flex justify-content-evenly align-items-end gap-2 flex-nowrap'}>
            <div
                style={{opacity: disabled ? 0.2 : 1}}
                className={'d-flex justify-content-evenly align-items-end gap-4 flex-nowrap'}
            >
                <div className={'d-flex align-items-center gap-2'}>
                    <button
                        onClick={() => incrementValue(-1)}
                        className={'appBtn px-1 fs-7 greyBtn'}
                        style={{minHeight: '30px', minWidth: '30px'}}
                        disabled={disabled}
                    >
                        <b>-1</b>
                    </button>
                    <button
                        onClick={() => incrementValue(-5)}
                        className={'appBtn px-1 fs-7 greyBtn'}
                        style={{minHeight: '30px', minWidth: '30px'}}
                        disabled={disabled}
                    >
                        <b>-5</b>
                    </button>
                    <button
                        onClick={() => incrementValue(-25)}
                        className={'appBtn px-1 fs-7 greyBtn'}
                        style={{minHeight: '30px', minWidth: '30px'}}
                        disabled={disabled}
                    >
                        <b>-25</b>
                    </button>
                </div>

                <Slider
                    sx={{
                        maxWidth: 350,
                        minWidth: 350,
                        padding: 0,
                        margin: 0,
                        '&.MuiSlider-root': {
                            padding: '10px',
                            color: '#B0B0B0', // Цвет основного трека и ползунка
                        },
                        '& .MuiSlider-thumb': {
                            color: '#808080', // Цвет ползунка
                        },
                        '& .MuiSlider-track': {
                            color: '#A0A0A0', // Цвет заполненного трека
                        },
                        '& .MuiSlider-rail': {
                            color: '#D0D0D0', // Цвет незаполненного трека
                        },
                        '& .MuiSlider-mark': {
                            color: '#C0C0C0', // Цвет меток
                        },
                        '& .MuiSlider-markActive': {
                            color: '#909090', // Цвет активной метки
                        },
                    }}
                    step={25}
                    disabled={disabled}
                    marks
                    value={value}
                    min={0}
                    max={maxValue}
                    onChange={handleSliderChange}
                />
                <div className={'d-flex align-items-center gap-2'}>
                    <button
                        className={'appBtn fs-7 greyBtn px-1'}
                        style={{minHeight: '30px', minWidth: '30px'}}
                        onClick={() => incrementValue(1)}
                        disabled={disabled}
                    >
                        <b>+1</b>
                    </button>
                    <button
                        onClick={() => incrementValue(5)}
                        className={'appBtn fs-7 greyBtn px-1'}
                        style={{minHeight: '30px', minWidth: '30px'}}
                        disabled={disabled}
                    >
                        <b>+5</b>
                    </button>
                    <button
                        className={'appBtn fs-7 greyBtn px-1'}
                        onClick={() => incrementValue(25)}
                        style={{minHeight: '30px', minWidth: '30px'}}
                        disabled={disabled}
                    >
                        <b>+25</b>
                    </button>
                </div>
            </div>

            <Input
                value={inputValue}
                size="small"
                className={'fw-bold'}
                onChange={handleInputChange}
                readOnly={disabled}
                inputProps={{
                    min: 0,
                    max: maxValue,
                    type: 'number',
                    sx: {
                        padding: 0,
                    }
                }}
            />
        </div>
    );
};
