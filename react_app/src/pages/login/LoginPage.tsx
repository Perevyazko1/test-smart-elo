import {type FormEvent, useState} from "react";
import {toast} from "sonner";
import {useNavigate} from "react-router-dom";

import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";
import {authService} from "@/pages/login/model/api.ts";
import {USER_LOCALSTORAGE_TOKEN} from "@/shared/consts";
import {useCurrentUser} from "@/shared/utils/useCurrentUser.ts";


export const LoginPage = () => {
    const {setCurrentUser} = useCurrentUser();
    let navigate = useNavigate();
    const [value, setValue] = useState<string>();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (value?.length === 6) {
            toast.promise(authService.pinCodeLogin({pin_code: value}), {
                loading: 'Вход в систему...',
                success: (data) => {
                    if (data.data) {
                        localStorage.setItem(USER_LOCALSTORAGE_TOKEN, data.data.token);
                        setCurrentUser(data.data);
                        navigate('/')
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
        <div className={'flex flex-col gap-3 items-center justify-start pt-15 bg-gray-500 min-h-screen'}>
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