import {ReactNode} from "react";
import type {Metadata} from "next";

import localFont from "next/font/local";

import "./(styles)/globals.scss";

import {Header} from "@/components/navbar/Header";
import {Container} from "@/ui/containers/Container";
import {Footer} from "@/components/footer/Footer";
import {Breadcrumbs} from "@/components/breadcrumbs/Breadcrumbs";
import {ModalProvider} from "@/app/providers";


const montserratRegular = localFont({
    src: "./(fonts)/Montserrat-Regular.woff2",
    variable: "--font-montserrat-regular",
    weight: "400",
    preload: true,
});

const montserratThin = localFont({
    src: "./(fonts)/Montserrat-Thin.woff2",
    variable: "--font-montserrat-thin",
    weight: "100",
    preload: true,
});

const montserratMedium = localFont({
    src: "./(fonts)/Montserrat-Medium.woff2",
    variable: "--font-montserrat-medium",
    weight: "500",
    preload: true,
});


export const metadata: Metadata = {
    title: "СЗМК Главная",
    description: "Сайт ООО Северо-Западная Мебельная Компания (СЗМК)",
};


export default function RootLayout({children}: Readonly<{ children: ReactNode; }>) {

    return (
        <html lang="ru">
        <body
            className={`${montserratRegular.variable} ${montserratThin.variable} ${montserratMedium.variable} thinYScroll`}>
        <div id="modal-root"/>
        <ModalProvider>
            <Header/>

            <Container>
                <Breadcrumbs/>
                {children}
            </Container>

            <Footer/>
        </ModalProvider>
        </body>
        </html>
    );
}
