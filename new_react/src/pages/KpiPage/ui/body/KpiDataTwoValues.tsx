import {AppInput} from "@shared/ui";

interface KpiDataTwoValuesProps {
    name: string;
    value1: number;
    value2: number;
}

export const KpiDataTwoValues = (props: KpiDataTwoValuesProps) => {
    const {name, value1, value2} = props;

    return (
        <div className={"d-flex gap-1 align-items-center justify-content-between"}>
            {name}
            <div className={'d-flex gap-1'}>
                <div className={'d-flex gap-1 align-items-center'}>
                    % =
                    <AppInput
                        disabled
                        style={{width: '3rem', fontSize: 10}}
                        className={'bg-white text-black'}
                        value={value1}
                    />
                </div>

                <div className={'d-flex gap-1 align-items-center'}>
                    K =
                    <AppInput
                        disabled
                        style={{width: '3rem', fontSize: 10}}
                        className={'bg-white text-black'}
                        value={value2}
                    />
                </div>
            </div>
        </div>
    );
};