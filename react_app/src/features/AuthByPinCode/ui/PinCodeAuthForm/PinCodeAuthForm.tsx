import {useSelector} from "react-redux";
import React, {memo, useCallback} from 'react';

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {Input} from "shared/ui/Input/Input";
import {Checkbox} from "shared/ui/Checkbox/Checkbox";
import {Button, ButtonTypes} from "shared/ui/Button/Button";

import {authByPinCodeActions} from "../../model/slice/authByPinCodeSlice";
import {getPinCode} from "../../model/selectors/getPinCode/getPinCode";
import {authByPinCode} from "../../model/services/authByPinCode/authByPinCode";
import {getAuthByPinCodeState} from "../../model/selectors/getAuthByPinCodeState/getAuthByPinCodeState";
import {getRememberMe} from "../../model/selectors/getRememberMe/getRememberMe";
import {useAppDispatch} from "../../../../shared/lib/hooks/useAppDispatch/useAppDispatch";

export interface PinCodeAuthFormProps {
    className?: string
}

const PinCodeAuthForm = memo((props: PinCodeAuthFormProps) => {
    const dispatch = useAppDispatch()
    const pin_code = useSelector(getPinCode)
    const rememberMe = useSelector(getRememberMe)
    const authState = useSelector(getAuthByPinCodeState)

    const {className, ...otherProps} = props

    const setPinCode = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (!!Number(event.target.value)) {
            dispatch(authByPinCodeActions.setPinCode(Number(event.target.value)))
        }
    }, [dispatch])


    const setRememberMe = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(authByPinCodeActions.setRememberMe(event.target.checked))
    }, [dispatch])


    const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        dispatch(authByPinCode({pin_code, rememberMe}))
    }, [dispatch, pin_code, rememberMe]);

        const mods: Mods = {};

    return (
        <form
            className={classNames('', mods, [className])}
            method="post"
            onSubmit={handleSubmit}
            {...otherProps}
        >
            <div className="mb-3">{authState.error}</div>

            <div className="mb-3">
                <Input
                    onChange={setPinCode}
                    type="password"
                    placeholder="ПИН-код"
                    title="Разрешено использовать только цифры"
                    pattern="[0-9]+$"
                    autoFocus
                    inputMode="numeric"
                    maxLength={6}
                    minLength={6}
                    required
                />
            </div>

            <div
                className="form-check d-xl-flex justify-content-xl-start my-xl-2 mb-xl-3 ms-xl-2"
            >
                <Checkbox
                    id={"check-box-login-page-1"}
                    onChange={setRememberMe}
                >
                    Оставаться в системе
                </Checkbox>
            </div>

            <div className="mb-3">
                <Button
                    type={ButtonTypes.SUBMIT}
                    disabled={authState.isLoading}
                    className={"btn-primary d-block w-100"}
                >
                    Войти
                </Button>
            </div>

            <p className="text-muted">ПИН-код выдается администратором системы.</p>

        </form>
    );
});

export default PinCodeAuthForm;