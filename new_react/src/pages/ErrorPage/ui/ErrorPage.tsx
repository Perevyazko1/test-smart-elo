import {AppNavbar} from "@widgets/AppNavbar";
import {useState} from "react";
import {QueryContext} from "@features";
import {ModalProvider} from "@app";
import {useRouteError} from "react-router-dom";

export const ErrorPage = () => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);
    const error = useRouteError();
    console.error(error);

    return (
        <QueryContext>
            <ModalProvider>
                <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}/>
                <div className={'appBody'}>
                    <p>
                        Возникла ошибка. Обратитесь к администратору.

                        Код ошибки: {error?.toString()}
                    </p>
                </div>
            </ModalProvider>
        </QueryContext>
    );
};
