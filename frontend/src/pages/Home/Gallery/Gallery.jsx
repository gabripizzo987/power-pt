import React from 'react'
import pexels1 from "../../../assets/gallary/pexels1.png"
import pexels2 from "../../../assets/gallary/pexels2.png"
import pexels3 from "../../../assets/gallary/pexels3.jpg"
import pexels4 from "../../../assets/gallary/pexels4.jpg"
import pexels5 from "../../../assets/gallary/pexels5.jpg"


const Gallery = () => {
  return (
    <div className='md:w-[80%] mx-auto my-28'>
        <div className='mb-16'>
            <h1 className='text-[30px] font-bold text-center'>Le nostre immagini</h1>
        </div>

        {/* image container */}
        <div className='md:grid grid-cols-2 items-center justify-center gap-4'>
            <div className='mb-4 md:mb-0'>
                <img src={pexels1} alt="" className='md:h-[720px] w-full mx-auto rounded-sm'/>
            </div>
            <div className='gap-4 grid grid-cols-2 items-start'>
                <div>
                    <img src={pexels2} alt="" className='md:h-[350px] rounded-sm'/>
                </div>
                <div>
                    <img src={pexels4} alt="" className='md:h-[350px] rounded-sm'/>
                </div>
                <div>
                    <img src={pexels3} alt="" className='md:h-[350px] rounded-sm'/>
                </div>
                <div>
                    <img src={pexels5} alt="" className='md:h-[350px] rounded-sm'/>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Gallery