"use client"
import Image from "next/image";
import Link from "next/link";
import {useBreadcrumbs} from "@/utils/use-breadcrumbs";
import {cx} from "@/utils/class-builder";


export const Breadcrumbs = () => {
    const breadcrumbs = useBreadcrumbs();

    if (breadcrumbs.length < 2) {
        return (<></>);
    }

    return (
        <nav className={cx([
            'text-10 text-b_9B flex mt-15',
            'sm:mt-20',
            'md:text-14 sm:mt-35',
            'lg:text-16 lg:mt-35',
            'xl:'
        ])}>
            {breadcrumbs.map((breadcrumb, index) => (
                <span key={breadcrumb.link} className={'flex items-center'}>
                    <Link href={breadcrumb.link}>{breadcrumb.publicName}</Link>
                    {index < breadcrumbs.length - 1 &&
                        <Image
                            width={16}
                            height={10}
                            src={'/icons/arrow.svg'}
                            alt={'Следующая страница'}
                            className={cx([
                                'w-12 h-8 mx-10',
                                'sm:',
                                'md:h-10 md:w-15',
                                'lg:w-16',
                                'xl:'
                            ])}
                        />
                    }
                </span>
            ))}
        </nav>
    );
};