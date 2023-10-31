import React, {memo, useRef, useState} from 'react';
import {useSelector} from "react-redux";
import {Button, Dropdown, NavDropdown} from "react-bootstrap";
import {NavDropdownProps} from "react-bootstrap/NavDropdown";

import {useAppDispatch} from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import {getCurrentDepartment} from "entities/Employee";

import {getSeriesSize} from "../../../model/selectors/filtersSelectors/filtersSelectors";
import {eqFiltersActions} from "../../../model/slice/eqFiltersSlice";
import {useQueryParams} from "../../../../../shared/lib/hooks/useQueryParams/useQueryParams";


export const EqSetSeriesSize = memo((props: Omit<NavDropdownProps, 'title' | 'children' | 'active'>) => {
    const dispatch = useAppDispatch();

    const seriesSize = useSelector(getSeriesSize);
    const {setQueryParam, queryParameters} = useQueryParams();

    const [currentSeriesSize, setCurrentSeriesSize] = useState<string>(queryParameters.series_size || "1");

    const series_size_input = useRef<HTMLInputElement>(null);

    const currentDepartment = useSelector(getCurrentDepartment)
    if (currentDepartment?.single) {
        return <></>;
    }

    const confirmSeriesSize = () => {
        setQueryParam('series_size', currentSeriesSize === "1" ? "" : currentSeriesSize)
        // dispatch(eqFiltersActions.setSeriesSize(currentSeriesSize))
    }

    const changeCurrentSeriesSize = (value: number) => {
        if ((value < 0 && Number(currentSeriesSize) > 1) || (value > 0 && Number(currentSeriesSize) < 50)) {
            setCurrentSeriesSize(String(Number(currentSeriesSize) + value))
            if (series_size_input.current) {
                series_size_input.current.value = String(currentSeriesSize)
            }
        }
    }

    return (
        <NavDropdown
            title={`Размер серии X${queryParameters.series_size || '1'}`}
            active={seriesSize !== 1}
            {...props}
        >
            <Dropdown.ItemText>
                Выбор размера серии
            </Dropdown.ItemText>

            <Dropdown.Divider/>

            <div>
                <div
                    className={'d-flex justify-content-center fs-1 align-items-center text-warning fw-bold my-3'}
                    style={{minWidth: '320px'}}
                >
                    <Button
                        variant="outline-light"
                        className={'mx-3'}
                        style={{height: "50px", width: "60px"}}
                        onClick={() => changeCurrentSeriesSize(-1)}
                    >
                        <i className="fas fa-minus fs-4"/>
                    </Button>

                    Х {currentSeriesSize}

                    <Button
                        variant="outline-light"
                        className={'mx-3'}
                        style={{height: "50px", width: "60px"}}
                        onClick={() => changeCurrentSeriesSize(1)}
                    >
                        <i className="fas fa-plus fs-3"/>
                    </Button>
                </div>
                <div className={'px-3 my-3'}>
                    <input
                        className="form-range"
                        type="range"
                        defaultValue={currentSeriesSize}
                        min={1}
                        max={50}
                        step={1}
                        ref={series_size_input}
                        onChange={() => setCurrentSeriesSize(series_size_input.current?.value || '1')}
                    />
                </div>
            </div>

            <Dropdown.Item>
                <div className={'d-flex justify-content-center'}>
                    <Button
                        className="btn btn-success btn-lg" type="button"
                        onClick={confirmSeriesSize}
                    >
                        Установить
                    </Button>
                </div>
            </Dropdown.Item>

        </NavDropdown>
    );
});