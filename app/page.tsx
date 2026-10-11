// EGS Homepage
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <h1 className="text-5xl font-bold mb-4 text-center">Elect of God Stitches</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        International and National fashion brand. Book a fitting, custom order, or consultation today.
      </p>
      
      <div className="flex gap-4">
        <Link href="/book" className="bg-black text-white px-8 py-3 rounded font-medium hover:bg-gray-800">
          Book Now
        </Link>
        <Link href="/admin" className="border border-gray-300 px-8 py-3 rounded font-medium hover:bg-gray-100">
          Admin Login
        </Link>
      </div>
    </main>
  );
}