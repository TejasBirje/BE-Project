// import React from 'react'
// import { employerFeatures, jobSeekerFeatures } from '../../../utils/data'

// const Features = () => {

//     return (
//         <section className='py-20 bg-white relative overflow-hidden'>
//             <div className='container mx-auto px-4 relative z-10'>
//                 <div className='text-center mb-16'>
//                     <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'> 
//                         Everything You Need for
//                         <span className='block bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>Success</span>
//                     </h2>
//                     <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
//                         Whether you're looking for your next opportunity or the perfect candidate, we have the tools and features to make it happen.
//                     </p>
//                 </div>

//                 <div className='grid md:grid-cols-2 gap-16 lg:gap-24'>


//                     {/* Job Seeker Section */}
//                     <div>
//                         <div className='text-center mb-12'>
//                             <h3 className='text-3xl font-bold text-gray-900 mb-4'>For Job Seekers</h3>
//                             <div className='w-24 h-1 bg-linear-to-r from-blue-500 to-blue-600 mx-auto rounded-full' />
//                         </div>

//                         <div className='space-y-8'>
//                             {jobSeekerFeatures.map((feature, index) => (
//                                 <div
//                                     key={index}
//                                     className='group flex items-start space-x-4 p-6 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-all duration-300 cursor-pointer'
//                                 >
//                                     <div className='shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-200 transition-colors'>
//                                         <feature.icon className='w-6 h-6 text-blue-600' />
//                                     </div>
//                                     <div>
//                                         <h4 className='text-xl font-semibold text-gray-900 mb-2'>
//                                             {feature.title}
//                                         </h4>
//                                     <p className='text-gray-600 leading-relaxed'>
//                                         {feature.description}
//                                     </p>
//                                 </div>
//                             </div>
//                         ))}
//                         </div>
//                     </div>

//                     {/* Employer Section */}
//                     <div>
//                         <div className='text-center mb-12'>
//                             <h3 className='text-3xl font-bold text-gray-900 mb-4'>For Employers</h3>
//                             <div className='w-24 h-1 bg-linear-to-r from-purple-500 to-purple-600 mx-auto rounded-full'/>
//                         </div>

//                     <div className='space-y-8'>
//                         {employerFeatures.map((feature, index) => (
//                             <div
//                             key={index}
//                             className='group flex items-start space-x-4 p-6 rounded-2xl bg-gray-50 hover:bg-purple-50 transition-all duration-300 cursor-pointer'
//                             >
//                                 <div className='shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors'>
//                                     <feature.icon className='w-6 h-6 text-purple-600'/>
//                                 </div>
//                                 <div>
//                                     <h4 className='text-xl font-semibold text-gray-900 mb-2'>
//                                         {feature.title}
//                                     </h4>
//                                     <p className='text-gray-600 leading-relaxed'>
//                                         {feature.description}
//                                     </p>
//                                 </div>
//                             </div>
//                         ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </section>
//     )
// }

// export default Features

import React from 'react'
import { motion } from 'framer-motion'
import { employerFeatures, jobSeekerFeatures } from '../../../utils/data'

const FeatureCard = ({ feature, index, accent }) => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.55 }}
        viewport={{ once: true }}
        className={`group flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm
            hover:shadow-md hover:border-${accent}-100 transition-all duration-300 cursor-default`}
    >
        <div className={`shrink-0 w-11 h-11 bg-${accent}-50 rounded-xl flex items-center justify-center
            group-hover:bg-${accent}-100 transition-colors duration-300`}>
            <feature.icon className={`w-5 h-5 text-${accent}-600`} />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className='text-[15px] font-semibold text-slate-900 mb-1 leading-snug'>
                {feature.title}
            </h4>
            <p className='text-sm text-slate-500 leading-relaxed'>
                {feature.description}
            </p>
        </div>
    </motion.div>
);

const Features = () => {
    return (
        <section className='py-16 sm:py-20 bg-slate-50 relative overflow-hidden'>

            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>

            <div className='container mx-auto px-4 sm:px-6 relative z-10'>

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65 }}
                    viewport={{ once: true }}
                    className='text-center mb-12 sm:mb-16'
                >
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mb-5">
                        Platform Features
                    </span>
                    <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-5 leading-tight tracking-tight'>
                        Everything You Need for{' '}
                        <span className='bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                            Success
                        </span>
                    </h2>
                    <p className='text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed'>
                        Whether you're looking for your next opportunity or the perfect candidate,
                        we have the tools and features to make it happen.
                    </p>
                </motion.div>

                {/* Two-column feature grid */}
                <div className='grid md:grid-cols-2 gap-8 lg:gap-12'>

                    {/* Job Seekers */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -16 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.55 }}
                            viewport={{ once: true }}
                            className='flex items-center gap-3 mb-6'
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200">
                                <span className="text-white text-xs font-bold">JS</span>
                            </div>
                            <div>
                                <h3 className='text-xl font-bold text-slate-900'>For Job Seekers</h3>
                                <p className='text-xs text-slate-400 font-medium mt-0.5'>Find & land your next role</p>
                            </div>
                            <div className='ml-auto h-0.5 flex-1 max-w-[3rem] bg-gradient-to-r from-blue-400 to-blue-600 rounded-full' />
                        </motion.div>

                        <div className='space-y-3'>
                            {jobSeekerFeatures.map((feature, index) => (
                                <FeatureCard key={index} feature={feature} index={index} accent="blue" />
                            ))}
                        </div>
                    </div>

                    {/* Employers */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.55 }}
                            viewport={{ once: true }}
                            className='flex items-center gap-3 mb-6'
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-700 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-200">
                                <span className="text-white text-xs font-bold">ER</span>
                            </div>
                            <div>
                                <h3 className='text-xl font-bold text-slate-900'>For Employers</h3>
                                <p className='text-xs text-slate-400 font-medium mt-0.5'>Hire faster, smarter</p>
                            </div>
                            <div className='ml-auto h-0.5 flex-1 max-w-[3rem] bg-gradient-to-r from-indigo-400 to-violet-600 rounded-full' />
                        </motion.div>

                        <div className='space-y-3'>
                            {employerFeatures.map((feature, index) => (
                                <FeatureCard key={index} feature={feature} index={index} accent="indigo" />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default Features