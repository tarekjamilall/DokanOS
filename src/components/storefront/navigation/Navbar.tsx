// 'use client';

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
//   ShoppingBag,
//   Search,
//   Menu,
//   X,
//   Phone,
//   Truck,
//   Heart,
//   ChevronRight,
// } from 'lucide-react';

// interface NavbarProps {
//   cartCount?: number;
// }

// export default function Navbar({ cartCount = 1 }: NavbarProps) {
//   const pathname = usePathname();
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');

//   // নেভিগেশন লিংকসমূহ
//   const navLinks = [
//     { name: 'হোম', href: '/' },
//     { name: 'শপ ক্যাটালগ', href: '/shop' },
//     { name: 'স্পেশাল অফার', href: '/offer' },
//   ];

//   return (
//     <header className="sticky top-0 z-40 w-full transition-all">
//       {/* 📢 ১. টপ অ্যানাউন্সমেন্ট বার */}
//       <div className="bg-[#8A1538] text-white text-[11px] font-bold py-1.5 px-4">
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Truck className="w-3.5 h-3.5 text-rose-200" />
//             <span>সারা দেশে দ্রুত ক্যাশ অন ডেলিভারি সুবিধায় অর্ডার করুন</span>
//           </div>
//           <div className="hidden sm:flex items-center gap-4">
//             <a
//               href="tel:01700000000"
//               className="flex items-center gap-1 hover:text-rose-200 transition-colors"
//             >
//               <Phone className="w-3.5 h-3.5" />
//               <span>হেল্পলাইন: 01700000000</span>
//             </a>
//           </div>
//         </div>
//       </div>

//       {/* 🧭 ২. মূল গ্লাসফর্মিজম নেভিগেশন বার */}
//       <nav className="bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-2xs">
//         <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
//           {/* ব্র্যান্ড লোগো */}
//           <Link href="/" className="flex items-center gap-2 shrink-0">
//             <div className="w-9 h-9 bg-[#8A1538] text-white rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
//               ই
//             </div>
//             <span className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
//               ই-কমার্স<span className="text-[#8A1538]">শপ</span>
//             </span>
//           </Link>

//           {/* 🔍 সার্চ বার (ডেস্কটপ) */}
//           <div className="hidden md:flex flex-1 max-w-md relative">
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="পণ্য বা ক্যাটাগরি খুঁজুন..."
//               className="w-full h-10 pl-9 pr-4 text-xs font-semibold text-stone-900 bg-stone-100 border border-stone-200/80 rounded-2xl outline-none focus:bg-white focus:border-[#8A1538] focus:ring-1 focus:ring-[#8A1538] transition-all"
//             />
//             <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
//           </div>

//           {/* 🔗 মেনু লিংকসমূহ (ডেস্কটপ) */}
//           <div className="hidden lg:flex items-center gap-6 text-xs font-bold text-stone-700">
//             {navLinks.map((link) => {
//               const isActive = pathname === link.href;
//               return (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   className={`transition-colors hover:text-[#8A1538] ${
//                     isActive ? 'text-[#8A1538] font-extrabold' : ''
//                   }`}
//                 >
//                   {link.name}
//                 </Link>
//               );
//             })}
//           </div>

//           {/* 🛒 একশন বাটনসমূহ (কার্ট ও মোবাইল টগল) */}
//           <div className="flex items-center gap-2">
//             {/* কার্ট আইকন */}
//             <Link
//               href="/checkout"
//               className="relative p-2 rounded-xl text-stone-800 hover:bg-stone-100 transition-all flex items-center gap-2"
//               title="কার্ট দেখুন"
//             >
//               <div className="relative">
//                 <ShoppingBag className="w-5 h-5 text-stone-800" />
//                 {cartCount > 0 && (
//                   <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#8A1538] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
//                     {cartCount}
//                   </span>
//                 )}
//               </div>
//               <span className="hidden sm:inline text-xs font-extrabold text-stone-800">
//                 কার্ট
//               </span>
//             </Link>

//             {/* মোবাইল হামবার্গার বাটন */}
//             <button
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//               className="lg:hidden p-2 rounded-xl text-stone-800 hover:bg-stone-100 transition-all"
//             >
//               {isMobileMenuOpen ? (
//                 <X className="w-6 h-6" />
//               ) : (
//                 <Menu className="w-6 h-6" />
//               )}
//             </button>
//           </div>

//         </div>

//         {/* 📱 মোবাইল সার্চ বার (শুধুমাত্র মোবাইলে নেভবারের নিচে আসবে) */}
//         <div className="md:hidden px-4 pb-3">
//           <div className="relative">
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="পণ্য খুঁজুন..."
//               className="w-full h-9 pl-9 pr-3 text-xs font-semibold text-stone-900 bg-stone-100 border border-stone-200 rounded-xl outline-none"
//             />
//             <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
//           </div>
//         </div>
//       </nav>

//       {/* 📱 মোবাইল মেনু ড্রোয়ার (Slide-down Menu) */}
//       {isMobileMenuOpen && (
//         <div className="lg:hidden bg-white border-b border-stone-200 p-4 space-y-3 animate-fadeIn shadow-lg">
//           <div className="flex flex-col space-y-2">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.href}
//                 href={link.href}
//                 onClick={() => setIsMobileMenuOpen(false)}
//                 className="flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-stone-800 hover:bg-stone-50"
//               >
//                 <span>{link.name}</span>
//                 <ChevronRight className="w-4 h-4 text-stone-400" />
//               </Link>
//             ))}
//           </div>

//           <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-600 px-2">
//             <span>কাস্টমার সাপোর্ট:</span>
//             <a href="tel:01700000000" className="text-[#8A1538]">
//               01700000000
//             </a>
//           </div>
//         </div>
//       )}
//     </header>
//   );
// }
