import {AppSelect} from "@shared/ui";
import {AppRangeInput} from "@shared/ui/AppRangeInput/AppRangeInput";
import {useEmployeeName} from "@shared/hooks";


interface AmountDetailProps {
    label: string;
    userId: number;
    amount: number;
    maxValue: number;
    disabled: boolean;
    setValue?: (newAmount: number) => void;
}

export const AmountDetail = (props: AmountDetailProps) => {
    const {disabled, setValue, userId,label, amount, maxValue} = props;

    const {getNameById} = useEmployeeName();


    return (
        <>
            <div className={'d-flex flex-nowrap'}>
                <AppSelect
                    value={userId}
                    style={{width: 220}}
                    readOnly
                    label={label}
                    variant={"dropdown"}
                    colorScheme={"lightInput"}
                    getOptionLabel={option => getNameById(option, 'listNameInitials')}
                />
                <AppRangeInput
                    disabled={disabled}
                    setValue={setValue}
                    maxValue={maxValue}
                    value={amount}
                />
            </div>
            <hr className={'m-1 p-0'}/>
        </>
    );
};
