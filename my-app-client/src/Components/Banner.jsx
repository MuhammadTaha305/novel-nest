import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BannerCard from '../home/BannerCard'

const Banner = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <div className='px-4 lg:px-24 bg-black flex items-center'>
      <div className='flex w-full flex-col md:flex-row justify-between items-center gap-12 py-40'>
        {/* left side */}
        <div className='md:w-1/2 space-y-8 h-full'>
        <h2 className='text-5xl font-bold leading-snug text-white'>Read Your Favourite Novels <span className='text-[#5DD62C]'>Instantly</span></h2>
        <p className='md:w-4/54 text-white'>Books are the quietest and most constant of friends; they are the most accessible and wisest of counselors, and the most patient of teachers.</p>
        <form onSubmit={handleSearch}>
          <input 
            type='search' 
            name='search' 
            id='search' 
            placeholder='Novel Title / Genre'
            className='py-2 px-2 rounded-s-sm focus:outline-none focus:ring-0'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className='bg-[#5DD62C] px-6 py-2 text-white font-medium hover:bg-black transition-all ease-in duration-200'>Search</button>
        </form>
        </div>
        {/*right side*/}
        <div className='mr-15'><BannerCard /></div>
      </div>
    </div>
  )
}

export default Banner