import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  const currentPath = router.pathname;

return (
    <nav className="sticky top-0 z-60 bg-[#1e1e1e] py-4 min-h-[72px] shadow-md border-b border-gray-700 relative">
      <div className="flex items-center justify-between w-full px-8">
        {/* Mobile: Scrollable Links */}
        <div className="flex flex-nowrap justify-start items-center w-full gap-4 overflow-x-auto md:hidden pr-12">
          <Link
            href="/"
            className={`min-w-max text-lg font-semibold px-4 py-2 rounded-md transition ${
              currentPath === '/' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            Home
          </Link>
          <Link
            href="/deals"
            className={`min-w-max text-lg font-semibold px-4 py-2 rounded-md transition ${
              currentPath === '/deals' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            Deals
          </Link>
          <Link
            href="/simulations"
            className={`min-w-max text-lg font-semibold px-4 py-2 rounded-md transition ${
              currentPath === '/simulations' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            Simulations
          </Link>
          <Link
            href="/scorecard"
            className={`min-w-max text-lg font-semibold px-4 py-2 rounded-md transition ${
              currentPath === '/scorecard' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            Scorecard
          </Link>
        </div>

        {/* Desktop: Centered Links */}
        <div className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
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
        </div>

        {/* Profile Icon */}
        <Link href="/profile" className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-6 8a6 6 0 1112 0H4z" />
            </svg>
          </div>
        </Link>
      </div>
    </nav>
  );
}