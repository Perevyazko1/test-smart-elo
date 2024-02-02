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
        const perm =  await Notification.requestPermission();
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
                    <div>
                        <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}/>
                        {/*<TestBody/>*/}

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
