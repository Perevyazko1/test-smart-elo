import {AppNavbar} from "@widgets/AppNavbar";
import {QueryContext} from "@features";
import {ModalProvider} from "@app";
import {useRouteError} from "react-router-dom";

export const ErrorPage = () => {
    const error = useRouteError();
    console.error(error);

    return (
        <QueryContext>
            <ModalProvider>
                <AppNavbar/>
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
