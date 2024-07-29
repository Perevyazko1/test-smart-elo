import {useState, useEffect} from 'react';

export const useWindowDimensions = (heightEdit: number = 0, widthEdit: number = 0) => {
    // Поднимаем два стейта где будем хранить высоту и ширину блока. Инициализируем с учетом переданных параметров
    const [windowWidth, setWindowWidth] = useState(window.innerWidth + widthEdit);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight + heightEdit);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth + widthEdit);
            setWindowHeight(window.innerHeight + heightEdit);
            console.log('Window resized:', window.innerWidth, window.innerHeight);
        };
        // Добавляем слушатель событий который при изменении размеров окна будет изменять стейт
        window.addEventListener('resize', handleResize);

        // удаляем слушатель после демонтирования компонента
        return () => window.removeEventListener('resize', handleResize);
    }, [heightEdit, widthEdit]);

    return {
        windowWidth,
        windowHeight
    }
};
