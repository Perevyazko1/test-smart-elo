import {NavTopItem} from "@/ui/links/nav-top/NavTopItem";
import {cx} from "@/utils/class-builder";
import {PAGES} from "@/config/public-page.config";
import {MenuBtm} from "@/ui/buttons/MenuBtn";


export const NavTopGroup = () => {
    return (
        <nav className={'flex flex-1 flex-row-reverse'}>
            <ul className={cx([
                'flex flex-wrap items-center gap-x-12',
                'sm:gap-x-15',
                'md:gap-x-30',
                'lg:gap-x-40',
            ])}>
                <NavTopItem item={PAGES.HOME}/>
                <NavTopItem item={PAGES.DOCUMENTS}/>
                <NavTopItem item={PAGES.PROJECTS}/>
                <MenuBtm/>
            </ul>
        </nav>
    );
};