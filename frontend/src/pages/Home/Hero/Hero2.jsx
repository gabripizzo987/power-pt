import React from 'react'
import bgImg from "../../../assets/home/banner-2.jpg"

const Hero2 = () => {
  return (
    <div className='min-h-screen bg-cover' style={{backgroundImage: `url(${bgImg}`}}>
    <div className='min-h-screen flex justify-start p1-11 items-center text-white bg-black bg-opacity-60'>
      <div>
        <div className = 'space-y-4'>
          <p className='md:text-[40px] text-3x1'>Best Online</p>
          <h1 className='md:text-[55px] text-5x1 font-bold'>courses from home</h1>
          <div>
            <p>
              Lorem, ipsum dolor sit amet consectetur 
              adipisicing elit. Atque ab odit cumque qui 
              quaerat porro neque debitis facere laboriosam 
              ratione eum quod totam, corrupti numquam tenetur dolor modi? Dolore, maxime.</p>
              <div className= 'flex flex-wrap items-center gap-5'>
                <button className='px-7 py-3 rounded-1g bg-secondary font-bold uppercase'>Incomincia oggi</button>
                <button className='px-7 py-3 rounded-1g border hover:bg-secondary font-bold uppercase'>Vedi personal trainer</button>
              </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default Hero2