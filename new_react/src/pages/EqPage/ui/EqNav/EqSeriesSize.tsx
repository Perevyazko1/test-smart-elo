import {Button} from "react-bootstrap";
import {AppDropdown} from "@shared/ui";
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
        <AppDropdown selected={`Размер серии X${queryParameters.series_size || baseSeriesSize}`}
                     active={!!queryParameters.series_size}
                     items={['Подтвердить']}
                     onSelect={() => clb(seriesSize === baseSeriesSize ? '' : seriesSize)}
        >
            <div className={'p-2'}>
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
                <div>
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
                </div>
            </div>
        </AppDropdown>
    )
}