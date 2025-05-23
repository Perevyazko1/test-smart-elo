import {cx} from "@/utils/class-builder";
import {PageItemInfo} from "@/config/public-page.config";
import {LinkBtm} from "@/ui/buttons/LinkBtm";


interface ShowAllProps {
    link: PageItemInfo;
    text: string;
}


export const ShowAllBtn = (props: ShowAllProps) => {
    const {link, text} = props;

    return (
        <section className={cx([
            'flex justify-center',
            'sm:',
            'md:',
            'lg:mt-55',
            'xl:'
        ])}>
            <LinkBtm
                item={link}
                text={text}
            />
        </section>
    );
};