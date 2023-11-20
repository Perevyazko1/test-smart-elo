import React, {memo} from 'react';

import {Swiper, SwiperSlide} from "swiper/react";
import {Pagination} from 'swiper/modules';

import cls from './Slider.module.scss';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import {GET_STATIC_URL} from "@shared/consts";


interface AppSliderProps {
    price?: number,
    date?: string,
    images?: string[],
    width?: string,
    height?: string,
}


export const AppSlider = memo((props: AppSliderProps) => {
    const {
        price,
        date,
        images,
        width = '100px',
        height = '100px',
    } = props;

    return (
        <Swiper
            // install Swiper modules
            grabCursor={true}
            rewind={true}
            modules={[Pagination]}
            spaceBetween={50}
            slidesPerView={1}
            pagination={{
                type: 'bullets',
                horizontalClass: cls.swiperPagination,
            }}
            style={{width: width, height: height}}
            className={"d-flex justify-content-center align-items-center"}
        >
            <>
                {price &&
                    <div
                        style={{
                            position: "absolute",
                            bottom: "1px",
                            left: "2px",
                            margin: "auto",
                            zIndex: "999",
                            opacity: "0.4",
                            pointerEvents: "none",
                        }}
                    >
                        <div className={"fw-bold text-black bg-light border rounded me-1 fs-7"}
                             style={{padding: "0 0.1rem"}}>
                            {price}
                        </div>
                    </div>
                }

                {date &&
                    <div
                        style={{
                            position: "absolute",
                            bottom: "1px",
                            right: "2px",
                            margin: "auto",
                            zIndex: "999",
                            opacity: "0.4",
                            pointerEvents: "none",
                        }}
                    >
                        <div className={"fw-bolder bg-light border rounded fs-7"} style={{padding: "0 0.1rem"}}>
                            {date}
                        </div>
                    </div>
                }
            </>


            {images?.length && images.map((image_url) => (
                <SwiperSlide
                    style={{width: width, height: height}}
                    className={"d-flex justify-content-center align-items-center py-1"}
                    key={image_url}
                >
                    <img
                        src={GET_STATIC_URL() + image_url}
                        style={{maxWidth: width, maxHeight: height}}
                        className="rounded m-0 p-0"
                        alt={"Slide"}
                        loading={"lazy"}
                        // onClick={() => setShowModal(true)}
                    />
                </SwiperSlide>
            ))}

        </Swiper>
    );
});
