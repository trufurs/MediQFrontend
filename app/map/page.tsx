"use client";
import dynamic from 'next/dynamic'
import { use } from 'react'

export default dynamic(() => import('@/components/Map'), {
  ssr: false,
})