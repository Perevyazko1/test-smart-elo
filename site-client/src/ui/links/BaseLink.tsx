import Link from "next/link";

interface BaseLinkProps {
    link: string;
    text: string;
}

export const BaseLink = (props: BaseLinkProps) => {
    const {link, text} = props;

    return (
        <Link href={link} className={'text-blue-800 opacity-85'}>
            <u className={'underline-offset-[.125em] decoration-[1px]'}>
                {text}
            </u>
        </Link>
    );
};