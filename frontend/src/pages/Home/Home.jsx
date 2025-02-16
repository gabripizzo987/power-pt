import React from 'react'
import Gallery from './Gallery/Gallery'
import Hero from './Hero/Hero'

const Home = () => {
  return (
    <section>
      <Hero/>
      <div className='max-w-screen-x1 mx-auto'>
        <Gallery/>
      </div>
    </section>
  )
}

export default Home