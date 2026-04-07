'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4">Booking Platform</h1>
        <p className="text-gray-600 mb-6">
          A modern appointment booking system built with Next.js.
        </p>

        <div className="flex gap-4 justify-center">
          <button className="bg-black text-white px-6 py-3 rounded-xl hover:opacity-90" onClick={() => router.push('/book')}>
            Book Appointment
          </button>

          <button className="border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-100" onClick={() => router.push('/dashboard')}>
            Admin Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}