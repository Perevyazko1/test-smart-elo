"use client"
import {usePathname} from 'next/navigation';
import {PageItemInfo, PAGES} from "@/config/public-page.config";


export const useBreadcrumbs = (): PageItemInfo[] => {
    const pathname = usePathname();

    const findPageByPath = (path: string): PageItemInfo | undefined => {
        return Object.values(PAGES).reverse().find(page => {
            return path.startsWith(page.link);
        });
    };

    const buildBreadcrumbs = (page?: PageItemInfo): PageItemInfo[] => {
        if (!page) return [];
        const breadcrumbs = [];
        let current: PageItemInfo | undefined = page;

        while (current) {
            breadcrumbs.unshift(current);
            current = current.parent;
        }

        return breadcrumbs;
    };

    const currentPage = findPageByPath(pathname);
    return buildBreadcrumbs(currentPage);
};
