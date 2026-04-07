'use client';
import React from 'react'
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  return (
    <div>
      <button onClick={() => router.push('/')}>Home</button>
    </div>
  )
}