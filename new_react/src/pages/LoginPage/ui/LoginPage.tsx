import {useState} from "react";
import {Button} from "react-bootstrap";
import {AxiosError} from "axios";

import logo from '@shared/assets/images/SZMK Logo Dark Horizontal 900x350.png';
import {AppSwitch} from "@shared/ui";
import {USER_LOCALSTORAGE_TOKEN} from "@shared/consts";
import {Employee} from "@entities/Employee";
import {$axiosAPI, setRtkHeaders} from "@shared/api";
import {useCurrentUser} from "@shared/hooks";
import {QueryContext} from "@features";
import {ModalProvider} from "@app";


export const LoginPage = () => {
    const {setCurrentUser} = useCurrentUser();

    const [rememberMe, setRememberMe] = useState(false);
    const [pinCode, setPinCode] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>();

    const loginHandle = async () => {
        if (String(pinCode).length > 5) {
            try {
                const response = await $axiosAPI.post<Employee>('/staff/pin_code_authentication/', {
                    pin_code: pinCode,
                    rememberMe: rememberMe,
                });

                if (response.data.token) {
                    const token = response.data.token;
                    $axiosAPI.defaults.headers.common['Authorization'] = `Token ${token}`;
                    setRtkHeaders({'Authorization': `Token ${token}`});

                    if (rememberMe) {
                        localStorage.setItem(USER_LOCALSTORAGE_TOKEN, response.data.token);
                    }
                }

                setPinCode(null);
                setCurrentUser(response.data);
            } catch (error) {
                if (error instanceof AxiosError) {
                    if (error.response?.data) {
                        setErrorMsg(error.response.data)
                    }
                } else setErrorMsg('Неопознанная ошибка')
            }
        } else {
            setErrorMsg('Длина ПИН-кода должна быть 6 цифр')
        }
    }

    return (
        <QueryContext>
            <ModalProvider>
                <section className="py-1 py-xl-5" data-bs-theme={'light'}>
                    <div className="container">
                        <div className="row mb-5 my-xl-4 d-xl-block d-none">
                            <div className="col-md-8 col-xl-6 text-center mx-auto">
                                <h1>
                                    Вход в систему
                                </h1>
                            </div>
                        </div>
                        <form autoComplete="off">
                            <div className="row d-flex justify-content-center">
                                <div className="col-md-6 col-xl-4">
                                    <div className="mb-1 mb-xl-5 border rounded">
                                        <div className="d-flex flex-column align-items-center p-3 gap-2">
                                            <img
                                                className="px-xl-0 pe-xl-0 mx-xl-3 my-xl-1 mt-xl-0 py-xl-1 mb-2"
                                                src={logo} width="50%"
                                                alt={"LOGO"}
                                            />

                                            {errorMsg &&
                                                <h6 className={'text-danger'}>{errorMsg}</h6>
                                            }

                                            <input
                                                className={"password-field form-control text-center form-control-lg mb-2"}
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

                                            <div
                                                className="w-100 d-xl-flex justify-content-start p-1 mb-1 mb-xl-2"
                                            >
                                                <AppSwitch
                                                    checked={rememberMe}
                                                    onSwitch={(value) => setRememberMe(value)}
                                                    label={'Оставаться в системе'}
                                                />
                                            </div>

                                            <Button
                                                className={"btn-primary d-block w-100 mb-1 mb-xl-2"}
                                                onClick={loginHandle}
                                                disabled={String(pinCode).length < 6}
                                            >
                                                Войти
                                            </Button>

                                            <p className="text-muted">ПИН-код выдается администратором системы.</p>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </section>
            </ModalProvider>
        </QueryContext>
    );
};
