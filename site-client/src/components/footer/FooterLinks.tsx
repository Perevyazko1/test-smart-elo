import Link from "next/link";

import {cx} from "@/utils/class-builder";
import {PageItemInfo} from "@/config/public-page.config";
import {ComingSoon} from "@/ui/src/ComingSoon";
import {HeaderLinkTitle} from "@/components/footer/HeaderLinkTitle";
import {FooterUl} from "@/components/footer/FooterUl";
import {FooterLi} from "@/components/footer/FooterLi";

interface FooterLinksProps {
    className?: string;
    title: string;
    links: PageItemInfo[];
}

export const FooterLinks = (props: FooterLinksProps) => {
    const {className = "", title, links} = props;

    return (
        <article className={cx([
            'min-w-[fit-content]',
            'sm:',
            'md:',
            'lg:',
            'xl:',
            className,
        ])}>
            <HeaderLinkTitle title={title}/>

            <FooterUl>
                {links.map(item => (
                    item.soon ? (
                        <ComingSoon key={item.link}>
                            <FooterLi>{item.publicName}</FooterLi>
                        </ComingSoon>
                    ) : (
                        <Link href={item.link} key={item.link}>
                            <FooterLi>{item.publicName}</FooterLi>
                        </Link>
                    )
                ))}
            </FooterUl>
        </article>
    );
};