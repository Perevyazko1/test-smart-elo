import {cx} from "@/utils/class-builder";
import {HeaderContacts} from "@/components/navbar/HeaderContacts";
import {HeaderLogo} from "@/components/navbar/HeaderLogo";
import {NavTopGroup} from "@/ui/links/nav-top/NavTopGroup";

export const HeaderTop = () => {
    return (
        <header className={cx([
            'sticky top-0 text-10 flex flex-col content-center items-center gap-y-35 z-40',
            'sm:text-12 sm:pb-0',
            'md:text-14',
            'lg:text-16',
        ])}>
            {/*Container sticky*/}
            <div className={cx([
                'sticky top-0 z-50 w-full max-w-[120rem] flex flex-wrap items-center gap-x-15 gap-y-20 px-15',
                'sm:px-35',
                'md:px-35',
                'lg:px-40',
            ])}>
                <HeaderContacts/>

                <HeaderLogo/>

                <NavTopGroup/>
            </div>
        </header>
    );
};