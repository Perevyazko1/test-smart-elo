import {AppInput} from "@shared/ui";

interface KpiDataOneValueProps {
    name: string;
    value: number;
}

export const KpiDataOneValue = (props: KpiDataOneValueProps) => {
    const {name, value} = props;

    return (
        <div className={"d-flex gap-1 align-items-center justify-content-between"}>
            {name}
            <div className={'d-flex gap-1 align-items-center'}>
                % = <AppInput
                disabled
                style={{width: '3rem', fontSize: 10}}
                className={'bg-white text-black'}
                value={value}
            />
            </div>
        </div>
    );
};