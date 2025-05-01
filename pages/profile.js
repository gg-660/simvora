import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    }
    getUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-gray-300">
        <div className="bg-[#1e1e1e] p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h1 className="text-3xl font-bold mb-6 text-white">Profile</h1>
          <p className="text-lg mb-6">Welcome, <span className="font-semibold text-white">{user.email}</span>!</p>
          <div className="mt-6 text-left">
            <h2 className="text-lg font-semibold mb-2 text-white">Change Password</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const newPassword = e.target.password.value;
                const { error } = await supabase.auth.updateUser({ password: newPassword });
                if (error) {
                  alert('Password update failed: ' + error.message);
                } else {
                  alert('Password updated successfully.');
                  e.target.reset();
                }
              }}
            >
              <input
                type="password"
                name="password"
                placeholder="New Password"
                className="w-full p-3 mb-4 bg-[#2a2a2a] text-white border border-[#2a2a2a] rounded-md"
                required
              />
              <button
                type="submit"
                className="w-full bg-[#475569] text-white font-semibold py-3 rounded-md hover:bg-[#3b4a5a] transition mb-4"
              >
                Update Password
              </button>
            </form>
          </div>
          <div className="mb-4"></div>
          <button
            onClick={handleLogout}
            className="w-full bg-[#475569] text-white font-semibold py-3 rounded-md hover:bg-[#3b4a5a] transition"
          >
            Logout
          </button>
        </div>
      </main>
    </>
  );
}
