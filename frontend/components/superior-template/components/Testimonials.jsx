import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "This platform has completely transformed how our team collaborates. The insights we get are invaluable.",
    author: "Sarah Chen",
    role: "CEO, TechStart",
    avatar: "/assets/images/avatar-1.png"
  },
  {
    quote: "The best investment we've made this year. Our productivity has increased by 40% since we started using it.",
    author: "Michael Roberts",
    role: "Product Manager, InnovateCo",
    avatar: "/assets/images/avatar-2.png"
  },
  {
    quote: "Seamless integrations and beautiful UI. Our customers love the experience and so do we.",
    author: "Emily Watson",
    role: "CTO, GrowthLabs",
    avatar: "/assets/images/avatar-3.png"
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trusted by the best in your industry
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Find out why our solution is the top choice for fast-growing startups.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="bg-gray-800 rounded-2xl p-8 border border-gray-700"
            >
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-medium">{testimonial.author}</div>
                  <div className="text-gray-500 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
