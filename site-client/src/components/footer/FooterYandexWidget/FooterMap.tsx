export const FooterMap = () => {
    return (
        <div className={'absolute w-full h-full top-0 left-0'}>
            <iframe
                className={'max-w-full object-fit-cover max-h-full pointer-events-auto'}
                src="https://yandex.ru/map-widget/v1/?um=constructor%3Abab66ecb8f18fd0890a842b1fd66dcd5dfb8acf73124cac719031681fde5e2ed&amp;source=constructor&scroll=false"
                width="100%"
                height="100%"
            ></iframe>
        </div>
    );
};