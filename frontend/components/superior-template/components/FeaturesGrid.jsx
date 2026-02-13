import { motion } from 'framer-motion';

const features = [
  {
    icon: '📊',
    title: 'Data insights',
    description: 'Make smarter, more informed decisions with powerful and actionable data insights, designed to empower your business.',
  },
  {
    icon: '👥',
    title: 'Collaborate together',
    description: 'Collaborate with your team, share updates instantly, and achieve your goals faster.',
  },
  {
    icon: '⚡',
    title: 'App shortcuts',
    description: 'Save time, boost efficiency, and focus on what truly matters for you.',
  },
  {
    icon: '🔗',
    title: 'Seamless integrations',
    description: 'Seamlessly connect your favorite apps and platforms with our powerful integrations.',
  },
  {
    icon: '📱',
    title: 'Smart widgets',
    description: 'Provides real-time data, actionable insights, and key metrics at a glance.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function FeaturesGrid() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Features designed to empower your workflow
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay ahead with tools that prioritize your needs, integrating insights and efficiency into one powerful platform.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors cursor-pointer group"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
