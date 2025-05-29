// src/components/Dashboard/Navbar.js
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext'; 
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { user, signOut, loading } = useAuth(); // Ambil 'loading' jika ingin menampilkan status loading
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth/login'); // Arahkan ke halaman login setelah logout
    } catch (error) {
      console.error('Error logging out:', error);
      // Anda bisa menambahkan notifikasi error di sini
    }
  };

  // Gaya dasar untuk demonstrasi, sebaiknya gunakan file CSS terpisah atau TailwindCSS
  const navStyle = {
    backgroundColor: '#2c3e50', // Warna biru gelap
    padding: '1rem 2rem',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
    textDecoration: 'none',
  };

  const navLinksStyle = {
    listStyle: 'none',
    display: 'flex',
    gap: '20px', // Jarak antar link
    margin: 0,
    padding: 0,
  };

  const linkItemStyle = {
    color: '#ecf0f1', // Warna putih keabu-abuan
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    transition: 'background-color 0.3s ease',
  };

  // Efek hover bisa ditambahkan dengan CSS :hover atau state di React
  // Untuk kesederhanaan, kita tidak menambahkannya di inline style ini

  const authSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  };

  const userInfoStyle = {
    fontSize: '0.9rem',
  };

  const buttonStyle = {
    backgroundColor: '#3498db', // Warna biru cerah
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'none', // Untuk Link yang bertindak sebagai tombol
    transition: 'background-color 0.3s ease',
  };


  return (
    <nav style={navStyle}>
      <div>
        <Link href="/dashboard" style={logoStyle}>
          RentalKamera App
        </Link>
      </div>

      <ul style={navLinksStyle}>
        <li><Link href="/rentals" style={linkItemStyle}>Rentals</Link></li>
        <li><Link href="/customers" style={linkItemStyle}>Customers</Link></li>
        <li><Link href="/equipment" style={linkItemStyle}>Equipment</Link></li>
        <li><Link href="/payments" style={linkItemStyle}>Payments</Link></li>

        {user && user.role === 'admin' && ( // Contoh link khusus admin
            <li><Link href="/admin/users" style={linkItemStyle}>Manage Users</Link></li>
        )}
      </ul>

      <div style={authSectionStyle}>
        {loading && <p style={{fontSize: '0.9rem'}}>Loading...</p>}
        {!loading && user ? (
          <>
            <span style={userInfoStyle}>
              Hi, {user.full_name || user.email}
              {user.role && ` (${user.role})`}
            </span>
            <button onClick={handleLogout} style={{...buttonStyle, backgroundColor: '#e74c3c' /* Warna merah untuk logout */}}>
              Logout
            </button>
          </>
        ) : (
          !loading && (
            <Link href="/auth/login" style={buttonStyle}>
              Login
            </Link>
          )
        )}
      </div>
    </nav>
  );
};

export default Navbar;