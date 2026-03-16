// import React from 'react'
// import { Briefcase } from "lucide-react";

// const Footer = () => {
//     return (
//         <footer className="relative bg-gray-50 text-gray-900 overflow-hidden">
//             <div className="relative z-10 px-6 py-16">
//                 <div className="max-w-6xl mx-auto">

//                     {/* Main Footer Content */}
//                     <div className="text-center space-y-8">

//                         {/* Logo/Brand */}
//                         <div className="space-y-1">
//                             <div className="flex items-center justify-center space-x-2 mb-6">
//                                 <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
//                                     <Briefcase className='w-6 h-6 text-white' />
//                                 </div>
//                                 <h3 className='text-4xl font-bold text-gray-800'>Hirely</h3>
//                             </div>

//                             <p className={`text-md text-gray-600 max-w-md mx-auto`}>
//                                 Connecting talented professionals with innovative companies
//                                 worldwide. Your career success is our mission.
//                             </p>
//                         </div>

//                         {/* Copyright */}
//                         <div className="space-y-1">
//                             <p className="text-md text-gray-600">
//                                 © {new Date().getFullYear()} Hirely. All rights reserved.
//                             </p>
//                             <p className="text-sm text-gray-500 italic">
//                                 Made with ❤️ by MAST
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </footer>
//     );
// };

// export default Footer;

import React from "react";
import { Briefcase } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 relative overflow-hidden">
      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 py-14">
        <div className="max-w-4xl mx-auto text-center">
          {/* Brand */}
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/30">
              <Briefcase className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Hirely
            </span>
          </div>

          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed mb-10">
            Connecting talented professionals with innovative companies
            worldwide. Your career success is our mission.
          </p>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10">
            {[
              { label: "About", href: "#" },
              { label: "Privacy Policy", href: "#" },
              { label: "Terms", href: "#" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm text-slate-500 hover:text-slate-200 transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-800 mb-8" />

          {/* Bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <p>© {new Date().getFullYear()} Hirely. All rights reserved.</p>
            <p className="italic text-slate-600">Made with ❤️ by MAST</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
