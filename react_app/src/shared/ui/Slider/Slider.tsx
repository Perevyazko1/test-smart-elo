import React, {memo, useState} from 'react';

import {Swiper, SwiperSlide} from "swiper/react";
import {Pagination} from "swiper";

import {ModalSlider} from "widgets/ModalSlider/ui/ModalSlider";

import cls from './Slider.module.scss';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import {GET_STATIC_URL} from "../../const/server_config";


interface SliderProps {
    price?: number,
    date?: string,
    images?: string[],
    thumbnails?: string[],
    width?: string,
    height?: string,
    clickable?: boolean,
}


export const Slider = memo((props: SliderProps) => {
    const {
        price,
        date,
        images,
        thumbnails,
        width = '100px',
        height = '100px',
        clickable = true,
    } = props;

    const [showModal, setShowModal] = useState(false);

    const getTargetImages = thumbnails || images;

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
                <div
                    style={{
                        position: "absolute",
                        bottom: "0px",
                        margin: "auto",
                        zIndex: "999",
                        opacity: "0.75",
                        pointerEvents: "none",
                    }}
                >
                    <div className={"fw-bold text-black bg-light border rounded me-1 fs-7"}
                         style={{padding: "0 0.15rem"}}>
                        {price}
                    </div>
                </div>

                {date &&
                    <div
                        style={{
                            position: "absolute",
                            top: "0px",
                            margin: "auto",
                            zIndex: "999",
                            opacity: "0.75",
                            pointerEvents: "none",
                        }}
                    >
                        <div className={"fw-bolder bg-light border rounded fs-7"} style={{padding: "0 0.15rem"}}>
                            {date}
                        </div>
                    </div>
                }
            </>


            {getTargetImages?.length && getTargetImages.map((image_url) => (
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
                        onClick={() => setShowModal(true)}
                    />
                </SwiperSlide>
            ))}

            {showModal && clickable &&
                <ModalSlider
                    onHide={() => setShowModal(false)}
                    urls={images || []}
                />
            }
        </Swiper>
    );
});
