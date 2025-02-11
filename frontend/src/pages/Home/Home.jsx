import React from 'react'
import HeroContainer from './Hero/HeroContainer'
import Gallery from './Gallery/Gallery'

const Home = () => {
  return (
    <section>
      <HeroContainer/>
      <div className='max-w-screen-x1 mx-auto'>
        <Gallery/>
      </div>
    </section>
  )
}

export default Home