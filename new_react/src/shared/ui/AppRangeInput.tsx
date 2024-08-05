import {Input, Slider} from "@mui/material";
import React from "react";

interface AppRangeInputProps {
    value: number;
    maxValue: number;
    setValue: (value: number) => void;
}

export const AppRangeInput = (props: AppRangeInputProps) => {
    const {value, maxValue, setValue} = props;

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
        setValue(event.target.value === '' ? 0 : Number(event.target.value));
    };

    return (
        <div className={'d-flex justify-content-evenly align-items-end gap-4 flex-nowrap'}>
            <div className={'d-flex align-items-center gap-2'}>
                <button
                    onClick={() => incrementValue(-1)}
                    className={'appBtn px-1 fs-7 blackBtn'}
                    style={{minHeight: '30px', minWidth: '30px'}}
                >
                    <b>-1</b>
                </button>
                <button
                    onClick={() => incrementValue(-5)}
                    className={'appBtn px-1 fs-7 blackBtn'}
                    style={{minHeight: '30px', minWidth: '30px'}}
                >
                    <b>-5</b>
                </button>
                <button
                    onClick={() => incrementValue(-25)}
                    className={'appBtn px-1 fs-7 blackBtn'}
                    style={{minHeight: '30px', minWidth: '30px'}}
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
                    '&.MuiSlider-root': {padding: '10px'}
                }}
                step={25}
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
                >
                    <b>+1</b>
                </button>
                <button
                    onClick={() => incrementValue(5)}
                    className={'appBtn fs-7 greyBtn px-1'}
                    style={{minHeight: '30px', minWidth: '30px'}}
                >
                    <b>+5</b>
                </button>
                <button
                    className={'appBtn fs-7 greyBtn px-1'}
                    onClick={() => incrementValue(25)}
                    style={{minHeight: '30px', minWidth: '30px'}}
                >
                    <b>+25</b>
                </button>
            </div>
            <Input
                value={value}
                size="small"
                className={'fw-bold'}
                onChange={handleInputChange}
                inputProps={{
                    min: 0,
                    max: 600,
                    type: 'number',
                    sx: {
                        padding: 0,
                    }
                }}
            />
        </div>
    );
};
