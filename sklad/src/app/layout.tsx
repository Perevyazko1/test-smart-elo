'use client';
import {Geist, Geist_Mono} from "next/font/google";

import "./globals.css";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ModalProvider} from "@/app/providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const queryClient = new QueryClient();


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <QueryClientProvider client={queryClient}>
            <html lang="ru">
            <head>
                <link rel="manifest" href="/manifest.json"/>
                <meta name="theme-color" content="#000000"/>
                <meta name="apple-mobile-web-app-capable" content="yes"/>
                <meta name="apple-mobile-web-app-status-bar-style" content="black"/>
                <meta name="apple-mobile-web-app-title" content="Склад"/>
                <link rel="apple-touch-icon" href="/logo192.png"/>
                <title>Склад</title>
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
            <ModalProvider>
                {children}
            </ModalProvider>
            <div id="modal-root"/>
            </body>
            </html>
        </QueryClientProvider>
    );
}
