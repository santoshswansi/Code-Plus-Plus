import React from 'react'

function Profile({name, width=7, textSize="xl", extraTailwindClasses=""}) {
  return (
    <div className={`rounded-full h-${width} w-${width} bg-black text-white flex items-center justify-center text-${textSize} ${extraTailwindClasses}`}>
        {name[0].toUpperCase()}
    </div>
  )
}

export default Profile