import type {HTMLAttributes} from "react";
import {twMerge} from "tailwind-merge";
import {Link} from "react-router-dom";
import {useCurrentUser} from "@/shared/utils/useCurrentUser.ts";
import {USER_LOCALSTORAGE_TOKEN} from "@/shared/consts";
import {Btn} from "@/shared/ui/buttons/Btn.tsx";

interface NavbarProps extends HTMLAttributes<HTMLDivElement> {
}

export const Navbar = (props: NavbarProps) => {
    const {children, ...otherProps} = props;
    const {setCurrentUser} = useCurrentUser();


    const logoutHandle = () => {
        setCurrentUser(undefined);
        localStorage.removeItem(USER_LOCALSTORAGE_TOKEN);
    }

    return (
        <div
            className={twMerge([
                "noPrint sticky top-0 z-50",
                "flex flex-row flex-nowrap items-center justify-between",
                "bg-black text-white",
                "h-10 gap-5 px-4",
            ])}
            {...otherProps}
        >
            <div className={'flex flex-nowrap gap-5 items-center'}>
                <div>
                    СЗМК Зарплата
                </div>
                <Link
                    to={'/salary'}
                >
                    Зарплата
                </Link>
                <Link
                    to={'/cash'}
                >
                    Касса
                </Link>
                <Link
                    to={'/plan'}
                >
                    План
                </Link>
                {children}
            </div>

            <div>
                <Btn
                    className={'text-white bg-black'}
                    onClick={logoutHandle}
                >
                    Выйти
                </Btn>
            </div>
        </div>
    );
};