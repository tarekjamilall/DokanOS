// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import {
//   Phone,
//   Mail,
//   MapPin,
//   ShieldCheck,
//   Truck,
//   RotateCcw,
//   Headphones,
// } from 'lucide-react';

// export default function Footer() {
//   return (
//     <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t border-stone-800">
//       <div className="max-w-7xl mx-auto px-4 space-y-10">
        
//         {/* 🛡️ ১. ট্রাস্ট ও সার্ভিস ফিচার ব্যাজ (৪-কলাম) */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 border-b border-stone-800">
//           <div className="flex items-center gap-3">
//             <Truck className="w-7 h-7 text-[#8A1538] shrink-0" />
//             <div>
//               <h4 className="text-xs font-bold text-white">দ্রুত ডেলিভারি</h4>
//               <p className="text-[11px] text-stone-400">সারা দেশে ২-৩ দিনে</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <ShieldCheck className="w-7 h-7 text-[#8A1538] shrink-0" />
//             <div>
//               <h4 className="text-xs font-bold text-white">১০০% অরিজিনাল</h4>
//               <p className="text-[11px] text-stone-400">গুণগতমানের নিশ্চয়তা</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <RotateCcw className="w-7 h-7 text-[#8A1538] shrink-0" />
//             <div>
//               <h4 className="text-xs font-bold text-white">সহজ রিটার্ন</h4>
//               <p className="text-[11px] text-stone-400">৭ দিনের রিটার্ন নীতি</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <Headphones className="w-7 h-7 text-[#8A1538] shrink-0" />
//             <div>
//               <h4 className="text-xs font-bold text-white">২৪/৭ সাপোর্ট</h4>
//               <p className="text-[11px] text-stone-400">অনলাইন কাস্টমার কেয়ার</p>
//             </div>
//           </div>
//         </div>

//         {/* 📋 ২. মূল ফুটার কন্টেন্ট (৪-কলাম) */}
//         <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
          
//           {/* ব্র্যান্ড ইনফো (৫ কলাম) */}
//           <div className="md:col-span-5 space-y-4">
//             <Link href="/" className="flex items-center gap-2">
//               <div className="w-8 h-8 bg-[#8A1538] text-white rounded-xl flex items-center justify-center font-black text-base">
//                 ই
//               </div>
//               <span className="text-lg font-black text-white">
//                 ই-কমার্স<span className="text-[#8A1538]">শপ</span>
//               </span>
//             </Link>
//             <p className="text-stone-400 leading-relaxed max-w-sm">
//               আমরা আপনাকে দিচ্ছি সবচেয়ে সেরা দামে ১০০% অরিজিনাল এবং কোয়ালিটিসম্পন্ন প্রিমিয়াম প্রডাক্টের নিশ্চয়তা। যেকোনো প্রয়োজনে কল করুন আমাদের হটলাইনে।
//             </p>
//           </div>

//           {/* ইম্পর্টেন্ট লিংক (৩ কলাম) */}
//           <div className="md:col-span-3 space-y-3">
//             <h3 className="text-xs font-bold text-white uppercase tracking-wider">
//               প্রয়োজনীয় লিংক
//             </h3>
//             <ul className="space-y-2 text-stone-400">
//               <li>
//                 <Link href="/shop" className="hover:text-white transition-colors">
//                   সকল প্রডাক্ট (Shop)
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/checkout" className="hover:text-white transition-colors">
//                   কার্ট ও চেকআউট
//                 </Link>
//               </li>
//               <li>
//                 <a href="#about" className="hover:text-white transition-colors">
//                   আমাদের সম্পর্কে
//                 </a>
//               </li>
//             </ul>
//           </div>

//           {/* যোগাযোগ ও হটলাইন (৪ কলাম) */}
//           <div className="md:col-span-4 space-y-3">
//             <h3 className="text-xs font-bold text-white uppercase tracking-wider">
//               যোগাযোগ
//             </h3>
//             <ul className="space-y-2.5 text-stone-400">
//               <li className="flex items-center gap-2">
//                 <Phone className="w-4 h-4 text-[#8A1538]" />
//                 <span>+৮৮০ ১৭০০০০০-০০০</span>
//               </li>
//               <li className="flex items-center gap-2">
//                 <Mail className="w-4 h-4 text-[#8A1538]" />
//                 <span>support@ecommerceshop.com</span>
//               </li>
//               <li className="flex items-start gap-2">
//                 <MapPin className="w-4 h-4 text-[#8A1538] shrink-0 mt-0.5" />
//                 <span>মিরপুর ১০, ঢাকা, বাংলাদেশ</span>
//               </li>
//             </ul>
//           </div>

//         </div>

//         {/* 💳 ৩. কপিরাইট ও পেমেন্ট পার্টনারস */}
//         <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
//           <p>© {new Date().getFullYear()} ই-কমার্স শপ। সর্বস্বত্ব সংরক্ষিত।</p>
//           <div className="flex items-center gap-3 font-bold text-stone-400">
//             <span>পেমেন্ট পার্টনারস:</span>
//             <span className="bg-stone-800 px-2 py-0.5 rounded border border-stone-700 text-rose-400">
//               bKash
//             </span>
//             <span className="bg-stone-800 px-2 py-0.5 rounded border border-stone-700 text-orange-400">
//               Nagad
//             </span>
//             <span className="bg-stone-800 px-2 py-0.5 rounded border border-stone-700 text-emerald-400">
//               COD
//             </span>
//           </div>
//         </div>

//       </div>
//     </footer>
//   );
// }
