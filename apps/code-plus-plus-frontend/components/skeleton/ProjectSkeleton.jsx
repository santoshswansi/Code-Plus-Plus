import React from 'react'
import { Skeleton } from '../ui/skeleton'

function ProjectSkeleton() {
  return (
    <div className="flex items-center justify-between h-25 w-90 bg-white shadow-[0px_0px_10px_rgba(0,0,0,0.13)] rounded-sm !px-4 !py-2">
        <div className="flex flex-col gap-2">
            <Skeleton className="w-40 h-6" />
            <Skeleton className="w-25 h-5" />
        </div>
        <div className="flex gap-2">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="w-5 h-5" />
            <Skeleton className="w-5 h-5" />
        </div>
    </div>
  )
}

export default ProjectSkeleton