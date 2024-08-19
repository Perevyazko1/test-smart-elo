import React, {memo, useMemo} from 'react';

import {Swiper, SwiperSlide} from "swiper/react";
import {Pagination} from 'swiper/modules';

import cls from './Slider.module.scss';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import {STATIC_URL} from "@shared/consts";


interface AppSliderProps {
    price?: number,
    totalPrice?: number,
    images?: string[],
    width?: string,
    height?: string,
    bgColor?: ' bg-warning' | ' bg-danger' | ' bg-light';
}


export const AppSlider = memo((props: AppSliderProps) => {
    const {
        price,
        totalPrice,
        images,
        bgColor = ' bg-light',
        width = '100px',
        height = '100px',
    } = props;

    const Sliders = useMemo(() => (
        images?.map(image => (
            <SwiperSlide
                style={{width: width, height: height}}
                className={"d-flex justify-content-center align-items-center py-1"}
                key={image}
            >
                <img
                    src={image.startsWith("http") || image.startsWith("blob") ? image : STATIC_URL + image}
                    style={{
                        maxWidth: width,
                        maxHeight: height,
                        objectFit: 'contain',
                        objectPosition: 'center',
                    }}
                    className="rounded m-0 p-0"
                    alt={"Slide"}
                    loading={"lazy"}
                />
            </SwiperSlide>))
    ), [height, images, width])

    return (
        <Swiper
            // install Swiper modules
            grabCursor={true}
            rewind={true}
            modules={[Pagination]}
            spaceBetween={50}
            slidesPerView={1}
            pagination={{
                dynamicBullets: true,
                horizontalClass: cls.swiperPagination,
            }}
            style={{width: width, height: height}}
            className={"d-flex justify-content-center align-items-center"}
        >
            <>
                {price !== undefined &&
                    <div
                        style={{
                            position: "absolute",
                            bottom: "1px",
                            left: "0",
                            margin: "auto",
                            zIndex: "999",
                            opacity: "0.7",
                            pointerEvents: "none",
                        }}
                    >
                        <div className={"fw-bold text-black border rounded me-1 fs-7" + bgColor}
                             style={{padding: "0 0.1rem"}}>
                            {price}
                        </div>
                    </div>
                }

                {totalPrice ?
                    <div
                        style={{
                            position: "absolute",
                            bottom: "1px",
                            right: "0",
                            margin: "auto",
                            zIndex: "999",
                            opacity: "0.7",
                            pointerEvents: "none",
                        }}
                    >
                        <div className={"fw-bolder bg-light border rounded fs-7"} style={{padding: "0 0.1rem"}}>
                            {totalPrice}
                        </div>
                    </div>
                    :
                    null
                }
            </>


            {images && images?.length > 0 ?
                Sliders
                :
                [
                    <SwiperSlide
                        style={{width: width, height: height}}
                        className={"d-flex justify-content-center align-items-center"}
                        key={'logo_vertical'}
                    >
                        <img
                            src={"/szmk_logo_v.png"}
                            style={{
                                maxWidth: width,
                                maxHeight: '100%',
                                // height: height,
                                objectFit: 'contain',
                                objectPosition: 'center',
                            }}
                            className="rounded m-0 p-3"
                            alt={"Slide"}
                        />
                    </SwiperSlide>
                ]
            }

        </Swiper>
    );
});
