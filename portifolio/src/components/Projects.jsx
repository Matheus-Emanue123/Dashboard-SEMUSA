import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import SectionTitle from "./SectionTitle";
import projects from "../data/projects";
import { Link } from "react-router-dom";

function Projects() {
  return (
    <section
      id="projects"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32"
    >
      <SectionTitle
        subtitle="Portfolio"
        title="Featured Projects"
      />

      <div className="grid md:grid-cols-2 gap-5 sm:gap-8">

        {projects.map((project) => (

          <motion.div
            key={project.title}
            whileHover={{ y: -8 }}
            transition={{ duration: .25 }}
            className="rounded-3xl border border-white/10 bg-zinc-900/70 backdrop-blur-lg p-5 sm:p-8"
          >

            <div className="flex items-center justify-between">

              <h3 className="text-xl sm:text-2xl font-bold break-words">
                {project.title}
              </h3>

              {project.status === "Private" ? (
                <Lock className="text-violet-400" />
              ) : (
                <span className="text-violet-400 text-xl">↗</span>
              )}

            </div>

            <p className="text-zinc-400 mt-5 sm:mt-6 leading-7">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-8">

              {project.technologies.map((tech) => (

                <span
                  key={tech}
                  className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs sm:text-sm"
                >
                  {tech}
                </span>

              ))}

            </div>

            <div className="mt-10">

              <Link
                to={`/projects/${project.id}`}
                className="inline-flex items-center text-violet-400 hover:text-violet-300 transition font-medium"
              >
                View Project →
              </Link>

            </div>

          </motion.div>

        ))}

      </div>

    </section>
  );
}

export default Projects;