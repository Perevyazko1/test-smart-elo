"use client"
import {cx} from "@/utils/class-builder";
import {useModal} from "@/utils/use-modal";
import {NavTopItemMobile} from "@/ui/links/nav-top/NavTopItemMobile";
import {PAGES} from "@/config/public-page.config";
import {AppIcon, ICONS} from "@/ui/icons/AppIcon";


export const MenuBtm = () => {
    const {handleOpen, closeNoConfirm} = useModal();

    const openMenuHandle = () => {
        handleOpen({
            content: (
                <ul className={'flex flex-col gap-25 px-8 relative'}>
                    <NavTopItemMobile item={PAGES.HOME} onClick={closeNoConfirm}/>
                    {/*<NavTopItemMobile item={PAGES.ABOUT} onClick={closeNoConfirm}/>*/}
                    <NavTopItemMobile item={PAGES.DOCUMENTS} onClick={closeNoConfirm}/>
                    <NavTopItemMobile item={PAGES.PROJECTS} onClick={closeNoConfirm}/>
                </ul>
            ),
            title: <h2 className="text-28 font-medium">Навигация</h2>
        })
    }

    return (
        <button type={'button'}
                className={cx([
                    'cursor-pointer h-25 w-25',
                    'sm:hidden',
                    'md:',
                    'lg:',
                    'xl:'
                ])}
                onClick={openMenuHandle}
        >
            <AppIcon icon={ICONS.MENU}/>
        </button>
    );
};