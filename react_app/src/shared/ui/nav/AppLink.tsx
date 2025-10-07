import {twMerge} from "tailwind-merge";
import {TriangleRightIcon} from "@radix-ui/react-icons";
import {Link} from "react-router-dom";
import {useEffect, useState} from "react";

interface IProps {
    path: string;
    name: string;
    border?: boolean;
    currentPath?: string;
    to?: string;
}

export function AppLink(props: IProps) {
    const {path, to, name} = props;

    const [currentPath, setCurrentPath] = useState("");

    useEffect(() => {
        const path = location.pathname.split('/')[1];
        setCurrentPath('/' + path);
    }, [location]);

    return (
        <Link
            className={twMerge(
                props.border ? 'border-b-1' : 'border-b-none',
                'p-2 flex items-center gap-2',
                currentPath === path ? 'border-b-yellow-500' : 'border-b-white ',
            )}
            to={to ? to : path}
        >
            <TriangleRightIcon/> {name}
        </Link>
    );
}