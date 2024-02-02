import React, {useState} from "react";

interface LogoutInfoProps {

}

export const LogoutInfo = () => {
    const [countdown, setCountdown] = useState<number>(0);

    return (
        <h3 className={'m-5'}>
            Выход из приложения при бездействии через {countdown} секунд
        </h3>
    );
};
