import {cx} from "@/utils/class-builder";
import Link from "next/link";
import {PAGES} from "@/config/public-page.config";

export const FooterInfo = () => {

    return (
        <section className={cx([
            'text-b_64 text-8 flex justify-between',
            'sm:text-10',
            'md:text-12',
            'lg:text-12',
            'xl:'
        ])}>
            <span>Все права защищены ©2025</span>

            <div className={cx([
                'flex flex-col gap-5 flex-wrap',
                'sm:gap-30 sm:flex-row',
                'md:gap-40',
                'lg:gap-101',
                'xl:'
            ])}>
                <Link href={PAGES.PUBLIC_OFFER.link}>
                    <span>{PAGES.PUBLIC_OFFER.publicName}</span>
                </Link>
                <Link href={PAGES.PRIVACY_POLICY.link}>
                    <span>{PAGES.PRIVACY_POLICY.publicName}</span>
                </Link>
            </div>
        </section>
    );
};