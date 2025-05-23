import {Container} from "@/ui/containers/Container";
import {cx} from "@/utils/class-builder";
import {FooterYandexMap} from "@/components/footer/FooterYandexWidget/FooterYandexMap";
import {FooterTitle} from "@/components/footer/FooterTitle";
import {FooterLinksBlock} from "@/components/footer/FooterLinksBlock";
import {FooterInfo} from "@/components/footer/FooterInfo";
import {FooterDivider} from "@/components/footer/FooterDivider";



export const Footer = () => {

    return (
        <Container>
            <footer className={cx([
                'pb-15',
                'sm:pb-20',
                'md:pb-35',
                'lg:pb-40',
                'xl:'
            ])}>
                <FooterTitle title={'Наши контакты'}/>

                <FooterYandexMap/>

                <FooterLinksBlock/>

                <FooterDivider/>

                <FooterInfo/>
            </footer>
        </Container>
    );
};
