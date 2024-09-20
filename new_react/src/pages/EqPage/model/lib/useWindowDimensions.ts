import {useContext, useEffect, useState} from 'react';
import {IsDesktopContext} from "@app";


export const useWindowDimensions = () => {
    // Поднимаем два стейта где будем хранить высоту и ширину блока. Инициализируем с учетом переданных параметров
    const isDesktop = useContext(IsDesktopContext);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight + (isDesktop ? -45 : 0));

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight + (isDesktop ? -45 : 0));
        };
        // Добавляем слушатель событий который при изменении размеров окна будет изменять стейт
        handleResize();
        window.addEventListener('resize', handleResize);

        // удаляем слушатель после демонтирования компонента
        return () => window.removeEventListener('resize', handleResize);
    }, [isDesktop, windowHeight]);

    return {
        windowWidth,
        windowHeight
    }
};
