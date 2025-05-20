import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import profilePic from "../assets/profile.jpg";
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import { FreeMode, Pagination } from 'swiper/modules';
import { FaStar } from 'react-icons/fa6';

const Review = () => {
  return (
    <div className='my-12 px-4 lg:px-24 bg-black'>
      <h2 className='text-5xl font-bold text-center mb-10 leading-snug text-[#5DD62C]'>Our Customers</h2>
      <div>
        <Swiper
          slidesPerView={3}
          spaceBetween={30}
          freeMode={true}
          pagination={{ clickable: true }}
          modules={[FreeMode, Pagination]}
          className="mySwiper"
        >
          <SwiperSlide className='shadow-[0_4px_15px_0_rgba(93,214,44,0.5)] bg-black py-8 px-4 md:m-5 rounded-lg border'>
            <div className='space-y-6'>
              <div className='text-amber-500 flex gap-2'>
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <div className='mt-7'>
                <p className='mb-5 text-[#5DD62C]'>Great service! I got exactly what I needed in no time.</p>
                <img src={profilePic} alt="avatar of reviewer" className='w-10 mb-4 rounded' />
                <h5 className='text-lg font-medium text-[#5DD62C]'>Zakriya Mansoor</h5>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide className='shadow-[0_4px_15px_0_rgba(93,214,44,0.5)] bg-black py-8 px-4 md:m-5 rounded-lg border'>
            <div className='space-y-6'>
              <div className='text-amber-500 flex gap-2'>
                <FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <div className='mt-7'>
                <p className='mb-5 text-[#5DD62C]'>Helpful and friendly team. I really appreciate their support.</p>
                <img src={profilePic} alt="avatar of reviewer" className='w-10 mb-4 rounded' />
                <h5 className='text-lg font-medium text-[#5DD62C]'>Hashir</h5>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide className='shadow-[0_4px_15px_0_rgba(93,214,44,0.5)] bg-black py-8 px-4 md:m-5 rounded-lg border'>
            <div className='space-y-6'>
              <div className='text-amber-500 flex gap-2'>
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <div className='mt-7'>
                <p className='mb-5 text-[#5DD62C]'>Everything worked perfectly. I would recommend this to anyone.</p>
                <img src={profilePic} alt="avatar of reviewer" className='w-10 mb-4 rounded' />
                <h5 className='text-lg font-medium text-[#5DD62C]'>M. Ahmad</h5>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide className='shadow-[0_4px_15px_0_rgba(93,214,44,0.5)] bg-black py-8 px-4 md:m-5 rounded-lg border'>
            <div className='space-y-6'>
              <div className='text-amber-500 flex gap-2'>
                <FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <div className='mt-7'>
                <p className='mb-5 text-[#5DD62C]'>Fast and reliable service. Very happy with the results.</p>
                <img src={profilePic} alt="avatar of reviewer" className='w-10 mb-4 rounded' />
                <h5 className='text-lg font-medium text-[#5DD62C]'>Ali</h5>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}

export default Review;
