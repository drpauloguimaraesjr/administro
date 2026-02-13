import { motion } from 'framer-motion';

export default function FeatureSection({ 
  pill, 
  title, 
  description, 
  image, 
  imagePosition = 'right',
  bgColor = 'bg-gray-50'
}) {
  const isImageRight = imagePosition === 'right';
  
  return (
    <section className={`py-24 px-6 ${bgColor}`}>
      <div className="max-w-7xl mx-auto">
        <div className={`flex flex-col ${isImageRight ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16`}>
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: isImageRight ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            {pill && (
              <span className="inline-block bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                {pill}
              </span>
            )}
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              {title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {description}
            </p>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: isImageRight ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1"
          >
            <div className="relative">
              <img 
                src={image} 
                alt={title}
                className="w-full rounded-2xl shadow-2xl"
              />
              {/* Decorative gradient */}
              <div className="absolute -z-10 inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur-3xl transform translate-y-4"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
