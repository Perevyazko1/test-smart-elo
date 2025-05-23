import Link from "next/link";
import Image from "next/image";

import {PAGES} from "@/config/public-page.config";
import {cx} from "@/utils/class-builder";

export const HeaderLogo = () => {

    return (
        <Link href={PAGES.HOME.link}>
            <Image
                className={cx([
                    'w-71 h-28',
                    'sm:w-[114px] sm:h-43',
                    'md:w-[145px] md:h-55',
                    'lg:w-[183px] lg:h-70',
                ])}
                src={'/images/logo_dark.png'}
                alt={'Логотип'}
                height={70}
                width={183}
            />
        </Link>
    );
};