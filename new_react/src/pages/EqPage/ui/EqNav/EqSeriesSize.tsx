import {Button} from "react-bootstrap";
import {AppSelect} from "@shared/ui";
import {useRef, useState} from "react";

interface EqSeriesSizeProps {
    queryParameters: Record<string, string>;
    clb: (value: string) => void;
}


export const EqSeriesSize = (props: EqSeriesSizeProps) => {
    const {queryParameters, clb} = props;

    const baseSeriesSize = '1';
    const seriesSizeConfig = {
        minValue: 1,
        maxValue: 30,
    }

    const [seriesSize, setSeriesSize] = useState(queryParameters.series_size || baseSeriesSize);
    const seriesSizeRef = useRef<HTMLInputElement | null>(null);

    const incrementSeriesSize = (value: number) => {
        if ((value < 0 && Number(seriesSize) > seriesSizeConfig.minValue) ||
            (value > 0 && Number(seriesSize) < seriesSizeConfig.maxValue)) {
            const result = String(Number(seriesSize) + value);
            setSeriesSize(result);
            if (seriesSizeRef.current) {
                seriesSizeRef.current.value = result;
            }
        }
    }


    return (
        <AppSelect
            label={'Размер серии'}
            colorScheme={'darkInput'}
            variant={'select'}
            style={{width: 100}}
            value={`X${queryParameters.series_size || baseSeriesSize}`}
        >
            <div className={'p-2 d-flex justify-content-center flex-nowrap flex-column align-items-center'}>
                <div className={'d-flex gap-3 fs-3 text-nowrap'}>
                    <Button
                        onClick={() => incrementSeriesSize(-1)}
                    >
                        <i className="fas fa-minus fs-4"/>
                    </Button>

                    X {seriesSize || baseSeriesSize}

                    <Button
                        onClick={() => incrementSeriesSize(1)}
                    >
                        <i className="fas fa-plus fs-4"/>
                    </Button>
                </div>
                <input
                    className={"mt-3 w-100"}
                    type="range"
                    defaultValue={queryParameters.series_size || baseSeriesSize}
                    min={1}
                    max={30}
                    step={1}
                    ref={seriesSizeRef}
                    onChange={() => setSeriesSize(seriesSizeRef.current?.value || baseSeriesSize)}
                />

                <button className={'appBtn greenBtn px-3 py-1 mt-3'}
                        onClick={() => clb(seriesSize === baseSeriesSize ? '' : seriesSize)}
                >
                    Подтвердить
                </button>
            </div>
        </AppSelect>
    );
}