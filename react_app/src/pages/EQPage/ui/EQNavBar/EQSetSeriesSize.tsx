import React, {memo, useRef, useState} from 'react';
import {useSelector} from "react-redux";
import {Dropdown, DropdownButton} from "react-bootstrap";

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";

import {eqActions, initialState} from "../../model/slice/eqSlice";
import {getSeriesSize} from "../../model/selectors/getSeriesSize/getSeriesSize";

interface EqSetSeriesSizeProps {
    className?: string
}


export const EqSetSeriesSize = memo((props: EqSetSeriesSizeProps) => {
    const {
        className,
        ...otherProps
    } = props

    const dispatch = useAppDispatch()
    const series_size = useSelector(getSeriesSize)

    const initial_value = initialState.series_size

    const series_size_input = useRef<HTMLInputElement>(null);
    const [current_series_size, setCurrentSeriesSize] = useState(series_size);

    const confirmSeriesSize = () => {
        dispatch(eqActions.setSeriesSize(current_series_size))
    }

    const changeCurrentSeriesSize = (value: number) => {
        if ((value < 0 && current_series_size > 1) || (value > 0 && current_series_size < 50)) {
            setCurrentSeriesSize(current_series_size + value)
            if (series_size_input.current) {
                series_size_input.current.value = String(current_series_size)
            }
        }
    }

    const mods: Mods = {};

    return (
        <DropdownButton
            variant={initial_value === series_size ? "outline-light" : "outline-light active"}
            menuVariant="dark"
            title={`Серия Х ${series_size}`}
            className={classNames('', mods, [className])}
            {...otherProps}
        >
            <Dropdown.ItemText>
                Выбор размера серии
            </Dropdown.ItemText>

            <Dropdown.Divider/>

            <div className={"mb-2"}>
                <h6 className="dropdown-header text-uppercase fs-3 fw-bold text-warning d-xl-flex justify-content-xl-center align-items-xl-center">
                    <button
                        className="btn btn-outline-light btn-sm d-xl-flex justify-content-xl-center align-items-xl-center me-3"
                        type="button"
                        style={{height: "50px", width: "60px"}}
                        onClick={() => changeCurrentSeriesSize(-1)}
                    >
                        <i className="fas fa-minus fs-4"/>
                    </button>

                    Х {current_series_size}

                    <div
                        className="btn btn-outline-light btn-sm d-xl-flex justify-content-xl-center align-items-xl-center ms-3"
                        style={{height: "50px", width: "60px"}}
                        onClick={() => changeCurrentSeriesSize(1)}
                    >
                        <i className="fas fa-plus fs-3"/>
                    </div>

                </h6>
            </div>
            <input
                className="form-range pt-xl-0 my-xl-0 px-xl-5"
                style={{transform: "scale(1.26)"}}
                type="range"
                defaultValue={1}
                min={1}
                max={50}
                step={1}
                ref={series_size_input}
                onChange={() => setCurrentSeriesSize(Number(series_size_input.current?.value))}
            />
            <Dropdown.Item>
                <button
                    className="btn btn-success btn-lg mx-xl-5 px-xl-5 my-xl-2" type="button"
                    onClick={confirmSeriesSize}
                >
                    Установить
                </button>
            </Dropdown.Item>
        </DropdownButton>
    );
});