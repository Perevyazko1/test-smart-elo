import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import {type FormEvent, useState} from "react";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {toast} from "sonner";
import {authService} from "@/pages/login/model/api.ts";
import type {IUser} from "@/pages/login/model/types.ts";
import {USER_LOCALSTORAGE_TOKEN} from "@/shared/consts";

interface LoginPageProps {
    onLogin: (user: IUser) => void;
}

export const LoginPage = (props: LoginPageProps) => {
    const {onLogin} = props;

    const [value, setValue] = useState<string>();

    console.log(value);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (value?.length === 6) {
            toast.promise(authService.pinCodeLogin({pin_code: value}), {
                loading: 'Вход в систему...',
                success: (data) => {
                    if (data.data) {
                        localStorage.setItem(USER_LOCALSTORAGE_TOKEN, data.data.token);
                        onLogin(data.data);
                        console.log(data.data);
                        return `${data.data.first_name}, успешный вход в систему!`;
                    } else {
                        return `Ошибка входа, попробуйте еще раз или обратитесь к администратору`
                    }

                },
                error: 'Error',
            });
        }
    }

    return (
        <div className={'flex flex-col gap-3 items-center justify-center pt-15'}>
            <form
                className={'flex flex-col gap-4 justify-center items-center'}
                onSubmit={handleSubmit}
            >
                <label className={'font-bold'}>Введите ПИН-код</label>
                <InputOTP
                    maxLength={6}
                    value={value}
                    onChange={(value) => setValue(value)}
                >
                    <InputOTPGroup>
                        <InputOTPSlot index={0}/>
                        <InputOTPSlot index={1}/>
                        <InputOTPSlot index={2}/>
                        <InputOTPSlot index={3}/>
                        <InputOTPSlot index={4}/>
                        <InputOTPSlot index={5}/>
                    </InputOTPGroup>
                </InputOTP>

                <Btn
                    disabled={value?.length !== 6}
                    type={'submit'}
                    className={'rounded-sm px-5 py-3'}
                >
                    Войти
                </Btn>
            </form>
        </div>
    );
};