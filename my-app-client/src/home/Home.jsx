import Banner from '../Components/Banner'
import BestSellerBooks from './BestSellerBooks'
import FavBook from './FavBook'
import PromoBanner from './PromoBanner'
import Review from './Review'

const Home = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Banner />
      <BestSellerBooks />
      <FavBook />
      <PromoBanner />
      <Review />
    </div>
  )
}

export default Home