import {EqOrderProduct} from "@widgets/EqCardList";
import {useMemo, useState} from "react";
import {useSetTiming} from "@widgets/EqCard/model/api/updateTiming";
import {useDebounce, usePermission} from "@shared/hooks";
import {Spinner} from "react-bootstrap";
import {APP_PERM} from "@shared/consts";

interface TimingWidgetProps {
    card: EqOrderProduct;
}

export const TimingWidget = (props: TimingWidgetProps) => {
    const {card} = props;

    const [timing, setTiming] = useState<string>(card.card_info.timing.toLocaleString("ru-RU"));
    const [updateTiming, {isLoading}] = useSetTiming();

    const isBoss = usePermission(APP_PERM.ELO_BOSS_VIEW_MODE);


    const debouncedUpdateTiming = useDebounce(
        (timing: number) => updateTiming({
            ps_id: card.card_info.ps_id,
            timing: Number(timing),
        }),
        500
    );

    const getBg = useMemo(() => {
        return timing !== "0" ? "bgGreen" : "bg-white";
    }, [timing])

    const setInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;

        // Убираем ведущие нули, но сохраняем "0" или "0."
        value = value.replace(/^0+/, "");
        // Проверяем, что строка соответствует формату числа (включая дробные)
        const isValidNumber = /^-?\d*\.?\d*$/.test(value);

        if (!isValidNumber || value === "") {
            value = "0"
        }
        setTiming(value);
        debouncedUpdateTiming(value);
    }

    const selectAll = (event: React.FocusEvent<HTMLInputElement>) => {
        // выделяем всё содержимое
        event.target.select();
    };

    return (
        <div>
            {
                isLoading ? (
                    <div>
                        <Spinner size={'sm'} animation={'grow'}/>
                    </div>
                ) : (
                    <div>🕐мин</div>
                )
            }

            <input
                className={'m-1 text-black p-0 text-center border py-1 fw-bold ' + getBg}
                style={{width: 45}}
                disabled={!isBoss}
                value={timing}
                type={'text'}
                pattern="[0-9]*\.?[0-9]*"
                onChange={setInputHandler}
                onFocus={selectAll}
            />
        </div>
    );
};