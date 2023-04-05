import {useDispatch, useSelector} from "react-redux";
import React, {memo} from 'react';

import axios, {AxiosError} from "axios";

import {classNames, Mods} from "shared/lib/classNames/classNames";
import {Input} from "shared/ui/Input/Input";
import {Checkbox} from "shared/ui/Checkbox/Checkbox";
import {Button, ButtonTypes} from "shared/ui/Button/Button";

import {authByPinCodeActions} from "../../model/slice/authByPinCodeSlice";
import {getPinCode} from "../../model/selectors/getPinCode/getPinCode";

export interface PinCodeAuthFormProps {
    className?: string
}

const PinCodeAuthForm = memo((props: PinCodeAuthFormProps) => {
    const dispatch = useDispatch()
    const pin_code = useSelector(getPinCode)

    const {className, ...otherProps} = props
    const mods: Mods = {};

    const setPinCode = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(authByPinCodeActions.setPinCode(event.target.value))
    }

    const setRememberMe = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(authByPinCodeActions.setRememberMe(event.target.checked))
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/v1/staff/pin_code_authentification',
                {pin_code: pin_code})
            console.log(response.data)
        } catch (error) {
            const err = error as AxiosError
            console.log(err.response?.data)
        }
    };

    return (
        <form
            className={classNames('', mods, [className])}
            method="post"
            onSubmit={handleSubmit}
            {...otherProps}
        >
            <div className="mb-3"></div>

            <div className="mb-3">
                <Input
                    onChange={setPinCode}
                    type="password"
                    placeholder="ПИН-код"
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