import {memo} from 'react';
import {classNames, Mods} from "shared/lib/classNames/classNames";
import cls from './Loader.module.scss'

interface LoaderProps {
    absoluteCentred?: boolean,
    className?: string
}


export const Loader = memo((props: LoaderProps) => {
    const {
        className,
        absoluteCentred = true,
        ...otherProps
    } = props

    const mods: Mods = {
        [cls.Loader]: true,
        [cls.absoluteCentred]: absoluteCentred,
    };

    return (
        <div
            role="status"
            className={classNames('spinner-grow', mods, [className])}
            {...otherProps}
        />
    );
});
