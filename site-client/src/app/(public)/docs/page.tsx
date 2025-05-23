import {PageHeader} from "@/ui/headers/PageHeader";
import {PAGES} from "@/config/public-page.config";
import {PageContainer} from "@/ui/containers/PageContainer";
import {cx} from "@/utils/class-builder";
import {DocsLinkItem} from "@/app/(public)/docs/DocsLinkItem";


const DocumentsPage = () => {
    return (
        <PageContainer>
            <PageHeader title={'Документы'}/>

            <section className={cx([
                'gap-20 text-12 border-b_00 grid grid-cols-3',
                'sm:text-16 sm:px-33 sm:py-33 sm:gap-20 sm:border-[1px]',
                'md:text-18 md:px-58 md:py-35 sm:gap-35',
                'lg:text-20 lg:px-60 lg:py-65 sm:gap-45',
                'xl:'
            ])}>
                <DocsLinkItem link={PAGES.PUBLIC_OFFER}/>
                <DocsLinkItem link={PAGES.PURCHASE_RULES}/>
                <DocsLinkItem link={PAGES.PRIVACY_POLICY}/>
            </section>
        </PageContainer>
    );
};

export default DocumentsPage;