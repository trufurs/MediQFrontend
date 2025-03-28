import Image from 'next/image'
import React from 'react'
import '@/styles/custom.css';
import Link from 'next/link';

const Navbar = () => {
  const user = true;

  return (
    <nav className='flex flex-row mt-4 p-2 px-20 justify-between  w-full'>
      <div className='flex'>
      <Image className='dark:invert ' src='/next.svg' alt='logo' width={50} height={50} />
      <h1 className='text p-2'>MediQ</h1>
      </div>
      <div className='flex flex-row navb' >
        <Link href='/home' className='p-2 grow px-5 navbLink'>Home</Link>
        <Link href='/mediciene' className='p-2 px-5 navbLink'>Mediciene</Link>
        <Link href='/map' className='p-2 px-5 navbLink'>Map 🗺️</Link>
        {user && <Link href='/inventory' className='p-2 px-5 navbLink'>Inventory</Link>}
        {user && <Link href='/orders' className='p-2 px-5 navbLink'>Orders</Link>}
      </div>
      <div className='flex object-right'>

        <Link href='/login' className='p-2 '>Login</Link>
        <Link href='/signup' className='p-2 '>Signup</Link>
      </div>
    </nav>
  )
}

// user , admin , store owner home , maps , mediciene , contact , login singup ,request for store manangement
//      inventory , orders 
 //     request= 

export default Navbar