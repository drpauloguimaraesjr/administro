import { motion } from 'framer-motion';

export default function TrustedBy() {
  const brands = [
    { name: 'Google', logo: '/assets/images/logo-google.png' },
    { name: 'Microsoft', logo: '/assets/images/logo-microsoft.png' },
    { name: 'Slack', logo: '/assets/images/logo-slack.png' },
    { name: 'Spotify', logo: '/assets/images/logo-spotify.png' },
    { name: 'Airbnb', logo: '/assets/images/logo-airbnb.png' },
  ];

  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-gray-500 text-sm mb-8"
        >
          Trusted by the world leaders
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-12 opacity-60"
        >
          {brands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="h-8"
            >
              <img 
                src={brand.logo} 
                alt={brand.name}
                className="h-full w-auto grayscale hover:grayscale-0 transition-all"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
