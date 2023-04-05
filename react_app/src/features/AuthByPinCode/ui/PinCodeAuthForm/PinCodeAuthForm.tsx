import axios, {AxiosError} from "axios";

import React, {memo, useState} from 'react';
import {classNames, Mods} from "shared/lib/classNames/classNames";
import {Input} from "shared/ui/Input/Input";
import {Checkbox} from "shared/ui/Checkbox/Checkbox";
import {Button, ButtonTypes} from "shared/ui/Button/Button";

export interface PinCodeAuthFormProps {
    className?: string
}

const PinCodeAuthForm = memo((props: PinCodeAuthFormProps) => {
    const [pin_code, setPinCode] = useState('');

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

    const {className, ...otherProps} = props

    const mods: Mods = {};

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
                    onChange={(event) => {
                        setPinCode(event.target.value)
                    }}
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