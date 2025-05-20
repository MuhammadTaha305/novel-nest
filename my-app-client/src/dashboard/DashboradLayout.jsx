import { Outlet } from 'react-router-dom'
import SideMenu from './SideMenu'


const DashboradLayout = () => {
  return (
    <div className='flex gap-4 min-h-screen bg-gradient-to-br from-gray-900 to-black flex-col md:flex-row'>
      <SideMenu />
      <div className='flex-1 overflow-auto'>
        <Outlet />
      </div>
    </div>
  )
}

export default DashboradLayout