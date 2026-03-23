import React from 'react'
import { TrendingUp, Users, Briefcase, Target } from "lucide-react"
import { motion } from 'framer-motion'

const colorMap = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   badge: 'bg-blue-50 text-blue-600 border border-blue-100',   bar: 'bg-blue-500',   ring: 'hover:border-blue-100' },
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', badge: 'bg-indigo-50 text-indigo-600 border border-indigo-100', bar: 'bg-indigo-500', ring: 'hover:border-indigo-100' },
    emerald:{ bg: 'bg-emerald-50',icon: 'text-emerald-600',badge: 'bg-emerald-50 text-emerald-600 border border-emerald-100',bar: 'bg-emerald-500',ring: 'hover:border-emerald-100' },
    amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  badge: 'bg-amber-50 text-amber-600 border border-amber-100',  bar: 'bg-amber-500',  ring: 'hover:border-amber-100' },
};

const Analytics = () => {
    const stats = [
        { icon: Users,     title: 'Active Users',     value: '37,000+', growth: '+20%', color: 'blue',    detail: 'professionals registered' },
        { icon: Briefcase, title: 'Jobs Posted',      value: '24,000+', growth: '+30%', color: 'indigo',  detail: 'across all industries' },
        { icon: Target,    title: 'Successful Hires', value: '13,000+', growth: '+15%', color: 'emerald', detail: 'placements this year' },
        { icon: TrendingUp,title: 'Match Rate',       value: '95%',     growth: '+8%',  color: 'amber',   detail: 'AI-powered accuracy' },
    ];

    return (
        <section className='py-16 sm:py-20 bg-white relative overflow-hidden'>

            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <div className="absolute -top-48 right-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-48 left-0 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-50" />
            </div>

            <div className='container mx-auto px-4 sm:px-6 relative z-10'>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65 }}
                    viewport={{ once: true }}
                    className='text-center mb-12 sm:mb-14'
                >
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full mb-5">
                        By the Numbers
                    </span>
                    <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-5 leading-tight tracking-tight'>
                        Platform{" "}
                        <span className='bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                            Analytics
                        </span>
                    </h2>
                    <p className='text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed'>
                        Real-time insights and data-driven results that showcase the power of our platform
                        in connecting talent with opportunities.
                    </p>
                </motion.div>

                {/* Stat Cards */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5'>
                    {stats.map((stat, index) => {
                        const c = colorMap[stat.color];
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 28 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08, duration: 0.55 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -3 }}
                                className={`group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg ${c.ring} transition-all duration-300`}
                            >
                                {/* Top row */}
                                <div className='flex items-start justify-between mb-5'>
                                    <div className={`w-11 h-11 ${c.bg} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className={`w-5 h-5 ${c.icon}`} />
                                    </div>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
                                        {stat.growth}
                                    </span>
                                </div>

                                {/* Value */}
                                <div className='mb-1'>
                                    <span className='text-3xl font-bold text-slate-900 tracking-tight'>
                                        {stat.value}
                                    </span>
                                </div>
                                <p className='text-sm font-semibold text-slate-700 mb-1'>{stat.title}</p>
                                <p className='text-xs text-slate-400'>{stat.detail}</p>

                                {/* Accent bar */}
                                <div className='mt-4 h-0.5 w-full bg-slate-100 rounded-full overflow-hidden'>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '70%' }}
                                        transition={{ delay: 0.3 + index * 0.08, duration: 0.8, ease: 'easeOut' }}
                                        viewport={{ once: true }}
                                        className={`h-full ${c.bar} rounded-full`}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </section>
    )
}

export default Analytics