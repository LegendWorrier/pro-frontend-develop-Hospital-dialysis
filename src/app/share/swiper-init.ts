import { register } from 'swiper/element/bundle';

let swiperInit = false;

export function useSwiper() {
    if (swiperInit) {
        return;
    }
    register();
    swiperInit = true;
}