import {PageItemInfo} from "@/config/public-page.config";
import {cx} from "@/utils/class-builder";
import {BaseLink} from "@/ui/links/BaseLink";


interface DocsLinkItemProps {
    link: PageItemInfo;
}

export const DocsLinkItem = (props: DocsLinkItemProps) => {
    const {link} = props;

    return (
        <>
            <div className={cx([
                'col-span-2',
                'sm:',
                'md:col-span-1',
                'lg:col-span-1',
                'xl:'
            ])}>{link.publicName}</div>

            <div className={cx([
                'text-10 col-span-1',
                'sm:text-12',
                'md:text-14 md:col-span-2',
                'lg:text-14 lg:col-span-2',
                'xl:'
            ])}>
                <BaseLink link={link.link} text={'Перейти'}/>
            </div>
        </>
    );
};