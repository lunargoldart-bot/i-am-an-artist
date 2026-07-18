import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  {
    key: "painting",
    label: "Paintings",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop",
    desc: "Oil, acrylic, watercolor & more",
    emoji: "🎨",
  },
  {
    key: "graphic_design",
    label: "Graphic Design",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=800&fit=crop",
    desc: "Visual identity, branding & digital art",
    emoji: "✏️",
  },
  {
    key: "photography",
    label: "Photography",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800&fit=crop",
    desc: "Capturing Zambia's beauty",
    emoji: "📷",
  },
  {
    key: "film",
    label: "Film & Video",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=800&fit=crop",
    desc: "Short films, documentaries & content",
    emoji: "🎬",
  },
  {
    key: "music",
    label: "Music",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=800&fit=crop",
    desc: "Albums, singles & performances",
    emoji: "🎵",
  },
  {
    key: "writing",
    label: "Writing & Literature",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=800&fit=crop",
    desc: "Poetry, novels, stories & scripts",
    emoji: "✍️",
  },
  {
    key: "culinary",
    label: "Culinary Arts",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=800&fit=crop",
    desc: "Chefs building their craft & community",
    emoji: "👨‍🍳",
  },
  {
    key: "sculpture",
    label: "Sculptures",
    image: "https://images.unsplash.com/photo-1544413660-299165566b1d?w=600&h=800&fit=crop",
    desc: "Stone, wood & metal works",
    emoji: "🗿",
  },
  {
    key: "digital_art",
    label: "Digital Art",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&h=800&fit=crop",
    desc: "NFTs, illustrations & generative art",
    emoji: "💻",
  },
  {
    key: "fashion",
    label: "Fashion",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=800&fit=crop",
    desc: "Design, style & wearable art",
    emoji: "👗",
  },
  {
    key: "dance",
    label: "Dance & Performance",
    image: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600&h=800&fit=crop",
    desc: "Traditional & contemporary movement",
    emoji: "💃",
  },
  {
    key: "pottery",
    label: "Pottery & Ceramics",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=800&fit=crop",
    desc: "Handcrafted ceramic art",
    emoji: "🏺",
  },
];

export default function CategoryGallery() {
  return (
    <section className="relative py-16 px-4 sm:px-6 bg-background overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url('https://media.firebaseClient.com/images/public/69fc831faa42f7d02c44d368/bd040c8d8_generated_image.png')"}} />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-4xl sm:text-5xl font-bold mb-3 text-white">Browse by Category</h2>
          <p className="text-primary/60 font-inter text-sm">Find your perfect piece</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link
                to={`/explore?category=${cat.key}`}
                className="group relative block overflow-hidden rounded-xl aspect-square"
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{cat.emoji}</span>
                    <h3 className="font-playfair text-sm font-semibold text-white">{cat.label}</h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}