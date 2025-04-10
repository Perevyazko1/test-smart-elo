import {useEffect, useState} from 'react';


export const useWindowDimensions = () => {
    // Поднимаем два стейта где будем хранить высоту и ширину блока. Инициализируем с учетом переданных параметров

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight - 45);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight - 45);
        };
        // Добавляем слушатель событий который при изменении размеров окна будет изменять стейт
        handleResize();
        window.addEventListener('resize', handleResize);

        // удаляем слушатель после демонтирования компонента
        return () => window.removeEventListener('resize', handleResize);
    }, [windowHeight]);

    return {
        windowWidth,
        windowHeight
    }
};
