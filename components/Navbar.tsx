'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
        <div className="container">
          <div className="nav-inner">
            <Link href="/" className="nav-logo">
              <Image src="/oohx_logo.png" alt="OOHX" width={110} height={30} priority style={{ width: 'auto', height: '30px' }} />
            </Link>

            <div className="nav-links">
              <Link href="/browse" className={`nav-link${isActive('/browse') ? ' active' : ''}`}>Browse Screens</Link>
              <Link href="/owners" className={`nav-link${isActive('/owners') ? ' active' : ''}`}>Media Owners</Link>
              <Link href="/how-it-works" className={`nav-link${isActive('/how-it-works') ? ' active' : ''}`}>How it Works</Link>
              <Link href="/solutions/brands" className={`nav-link${isActive('/solutions') ? ' active' : ''}`}>Solutions</Link>
              <Link href="/about" className={`nav-link${isActive('/about') ? ' active' : ''}`}>About</Link>
            </div>

            <div className="nav-actions">
              <Link href="/login" className="btn btn-ghost btn-sm">Đăng nhập</Link>
              <Link href="/request" className="btn btn-primary btn-sm">Get a Proposal</Link>
            </div>

            <div
              className={`nav-hamburger${menuOpen ? ' open' : ''}`}
              id="hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} id="mobile-menu">
        <Link href="/browse" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Browse Screens</Link>
        <Link href="/owners" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Media Owners</Link>
        <Link href="/how-it-works" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>How it Works</Link>
        <Link href="/solutions/brands" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Solutions</Link>
        <Link href="/about" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>About</Link>
        <Link href="/contact" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Liên hệ</Link>
        <div className="mobile-actions">
          <Link href="/login" className="btn btn-outline" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
          <Link href="/request" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Get Proposal</Link>
        </div>
      </div>
    </>
  );
}
