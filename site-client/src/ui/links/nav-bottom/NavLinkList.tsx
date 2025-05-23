import {cx} from "@/utils/class-builder";
import {NavLink} from "@/ui/links/nav-bottom/NavLink";
import {PAGES} from "@/config/public-page.config";
import {ComingSoon} from "@/ui/src/ComingSoon";
import {CATALOGUE} from "@/config/catalogue-page.config";

export const NavLinkList = () => {
    return (
        <nav>
            <ul className={cx([
                'flex flex-wrap gap-15',
                'sm:gap-15',
                'md:gap-30',
                'lg:gap-50',
                'xl:gap-50'
            ])}>
                <NavLink item={PAGES.PROJECTS}/>
                <ComingSoon><NavLink item={PAGES.CATALOGUE}/></ComingSoon>
                <NavLink item={PAGES.DOCUMENTS}/>
                <ComingSoon><NavLink item={CATALOGUE.NEW}/></ComingSoon>
                <ComingSoon><NavLink item={PAGES.DELIVERY}/></ComingSoon>
                <ComingSoon><NavLink item={PAGES.FEEDBACK}/></ComingSoon>
            </ul>
        </nav>
    );
};