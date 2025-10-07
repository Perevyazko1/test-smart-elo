import {useCurrentUser} from "@shared/hooks";
import {useEffect, useState} from "react";

interface IProps {
    onSuccess: () => void;
}

export const PinCodeCheck = (props: IProps) => {
    const {onSuccess} = props;
    const [pinCode, setPinCode] = useState<number | null>(null);
    const {currentUser} = useCurrentUser();

    useEffect(() => {
        if (pinCode && pinCode > 99999 && Number(pinCode) === Number(currentUser.pin_code)) {
            onSuccess();
        }
    }, [pinCode, onSuccess, currentUser.pin_code]);

    return (
        <div className={'d-flex flex-column gap-4 justify-content-center align-items-center pt-5'}>
            <div className={'fs-3'}>Введите ПИН-КОД ЭЛО</div>
            {pinCode && pinCode > 99999 ? (
                <div className={'text-danger fw-bold'}>
                    Неверный код
                </div>) : null}
            <input
                className={"password-field form-control text-center form-control-lg my-2 w-100"}
                type="text"
                placeholder="ПИН-код (6 цифр)"
                title="Разрешено использовать только цифры"
                pattern="[0-9]+$"
                autoFocus
                inputMode="numeric"
                maxLength={6}
                minLength={6}
                required
                autoComplete="new-password"
                onChange={(e) => setPinCode(Number(e.target.value))}
            />
        </div>
    );
}