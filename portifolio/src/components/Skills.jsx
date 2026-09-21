import { motion } from "framer-motion";
import SectionTitle from "./SectionTitle";

const categories = [
  {
    title: "Languages",
    skills: ["C", "C++", "JavaScript", "Python"],
  },
  {
    title: "Frontend",
    skills: ["HTML", "CSS", "React", "Vite", "Recharts"],
  },
  {
    title: "Backend",
    skills: ["Node.js", "Express"],
  },
  {
    title: "Database",
    skills: ["MySQL", "Supabase"],
  },
  {
    title: "AI",
    skills: ["LangChain", "ChromaDB", "Ollama", "Streamlit"],
  },
  {
    title: "Tools",
    skills: ["Git", "GitHub", "VS Code"],
  },
];

function Skills() {
  return (
    <section
      id="skills"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32"
    >
      <SectionTitle
        subtitle="Technologies"
        title="Skills"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 mt-10 sm:mt-16">
        {categories.map((category) => (
          <motion.div
            key={category.title}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 sm:p-8"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-violet-400 mb-5 sm:mb-6">
              {category.title}
            </h3>

            <div className="flex flex-wrap gap-3">
              {category.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default Skills;