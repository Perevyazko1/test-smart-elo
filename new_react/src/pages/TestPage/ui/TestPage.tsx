import React, {memo, useState} from "react";
import {AppNavbar} from "@widgets/AppNavbar";
import {DynamicComponent, QueryContext, ReducersList} from "@features";
import {eqPageReducer} from "@pages/EqPage/model/slice/eqPageSlice";
import {ModalProvider} from "@app";
import {Button} from "react-bootstrap";

// Список редьюсеров для инициализации
const initialReducers: ReducersList = {
    eqPage: eqPageReducer,
}

export const TestPage = memo(() => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);

    const btnClb = async () => {
        const perm = await Notification.requestPermission();
        console.log(perm)
        if (perm === 'granted') {
            new Notification('Приветики пистолетики');
        }
        alert('Приветики пистолетики')
    }

    return (
        <QueryContext>
            <ModalProvider>
                <DynamicComponent removeAfterUnmount={false} reducers={initialReducers}>
                    <div data-bs-theme={'light'}>
                        <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}/>
                        <form method='POST' action='https://demo.paykeeper.ru/create/'
                              className={'p-3 border border-2 rounded gap-2'}
                        >
                            Введите сумму оплаты:
                            <input type='text' name='sum' value='100'/> <br/>
                            Введите номер заказа:
                            <input type='text' name='orderid' value='123456'/> <br/>
                            Введите название услуги:
                            <input type='text' name='service_name' value='Тестовая оплата'/> <br/>
                            <input type='submit' value='Перейти к оплате'/>
                        </form>

                        <Button
                            onClick={btnClb}
                        >
                            Уведомление
                        </Button>
                    </div>
                </DynamicComponent>
            </ModalProvider>
        </QueryContext>
    );
});
