import {AppNavbar} from "@widgets/AppNavbar";
import {useState} from "react";

export const ErrorPage = () => {
    const [showCanvas, setShowCanvas] = useState<boolean>(false);

    return (
        <div>
            <AppNavbar showNav={showCanvas} closeClb={() => setShowCanvas(false)}/>
            <div className={'appBody'}>
                <p>
                Возникла ошибка. Проверьте доступы в сервис.
                </p>
            </div>
        </div>
    );
};
