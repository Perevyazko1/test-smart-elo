import {useEffect, useRef, useState} from "react";
import {useDebounce} from "@shared/hooks";

interface EqSeriesSizeProps {
    queryParameters: Record<string, string>;
    clb: (value: string) => void;
}


export const EqSeriesSize = (props: EqSeriesSizeProps) => {
    const {queryParameters, clb} = props;

    const baseSeriesSize = '1';
    const seriesSizeConfig = {
        minValue: 1,
        maxValue: 25,
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
    const debouncedClb = useDebounce(
        () => clb(seriesSize === baseSeriesSize ? '' : seriesSize),
        300
    );

    useEffect(() => {
        debouncedClb();
        //eslint-disable-next-line
    }, [seriesSize]);

    useEffect(() => {
        if (queryParameters.series_size!== seriesSize) {
            setSeriesSize(queryParameters.series_size || baseSeriesSize);
             if (seriesSizeRef.current) {
                seriesSizeRef.current.value = queryParameters.series_size || baseSeriesSize;
            }
        }
        //eslint-disable-next-line
    }, [queryParameters.series_size]);

    return (
        <div>
            <div className={'fs-7 d-flex justify-content-between gap-1 mt-2'}>
                <button
                    className={'flex-fill'}
                    onClick={() => incrementSeriesSize(-1)}
                >
                    <i className="fas fa-minus fs-7"/>
                </button>

                <span>X {seriesSize || baseSeriesSize}</span>

                <button
                    className={'flex-fill'}
                    onClick={() => incrementSeriesSize(1)}
                >
                    <i className="fas fa-plus fs-7"/>
                </button>
            </div>
            <input
                className={"w-100"}
                type="range"
                defaultValue={queryParameters.series_size || baseSeriesSize}
                min={seriesSizeConfig.minValue}
                max={seriesSizeConfig.maxValue}
                step={1}
                ref={seriesSizeRef}
                onChange={() => setSeriesSize(seriesSizeRef.current?.value || baseSeriesSize)}
            />
        </div>
    );
}