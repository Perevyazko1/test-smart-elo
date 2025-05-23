import {cx} from "@/utils/class-builder";
import {PageItemInfo} from "@/config/public-page.config";
import Link from "next/link";
import {HoverUnderline} from "@/ui/src/HoverUnderline";

interface NavLinkProps {
    item: PageItemInfo;
}

export const NavLink = (props: NavLinkProps) => {
    const {item} = props;

    return (
        <Link href={item.link}>
            <li className={cx([
                'text-10 relative group',
                'sm:text-10',
                'md:text-14',
                'lg:text-16',
                'xl:text-16'
            ])}>
                {item.publicName}
                <HoverUnderline/>
            </li>
        </Link>
    );
};