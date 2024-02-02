import {AppNavbar} from "@widgets/AppNavbar";
import {useState} from "react";
import {QueryContext} from "@features";
import {ModalProvider} from "@app";

export const ErrorPage = () => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);

    return (
        <QueryContext>
            <ModalProvider>
                <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}/>
                <div className={'appBody'}>
                    <p>
                        Возникла ошибка. Проверьте доступы в сервис.
                    </p>
                </div>
            </ModalProvider>
        </QueryContext>
    );
};
