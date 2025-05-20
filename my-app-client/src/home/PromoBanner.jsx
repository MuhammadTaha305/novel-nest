import { Link } from 'react-router-dom'
import bookPic from "../assets/awardbooks.png";

const PromoBanner = () => {
  return (
    <div className='mt-16 py-12 bg-black px-4 lg:px-24'>
      <div className='flex flex-col md:flex-row justify-between items-center'>
        <div className='md:w-1/2'>
          <h2 className='text-4xl font-bold mb-6 leading-snug text-[#5DD62C]'>2023 National Book Awards for Fiction shortlist</h2>          <Link to="/shop" className='mt-12 block'>
            <button className='bg-[#5DD62C] text-black font-semibold px-5 py-2 rounded hover:bg-[#4cc01f] transition-colors'>
              Get Promo Code
            </button>
          </Link>
        </div>
        <div>
          <img src={bookPic} alt="" className='w-96 mr-5'/>
        </div>
      </div>
    </div>
  )
}

export default PromoBanner