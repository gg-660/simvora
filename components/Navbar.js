import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <nav className="sticky top-0 z-60 flex items-center bg-[#1e1e1e] py-4 px-8 shadow-md border-b border-gray-700 relative">
      
      {/* Centered Links */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-8">
        <Link
          href="/"
          className={`text-lg font-semibold px-4 py-2 rounded-md transition ${
            currentPath === '/' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          Home
        </Link>
        <Link
          href="/deals"
          className={`text-lg font-semibold px-4 py-2 rounded-md transition ${
            currentPath === '/deals' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          Deals
        </Link>
        <Link
          href="/simulations"
          className={`text-lg font-semibold px-4 py-2 rounded-md transition ${
            currentPath === '/simulations' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          Simulations
        </Link>
        <Link
          href="/scorecard"
          className={`text-lg font-semibold px-4 py-2 rounded-md transition ${
            currentPath === '/scorecard' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          Scorecard
        </Link>
        {/* Analyze link removed */}
      </div>

      <Link href="/profile" className="ml-auto flex items-center justify-center">
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-6 8a6 6 0 1112 0H4z" />
          </svg>
        </div>
      </Link>

    </nav>
  );
}