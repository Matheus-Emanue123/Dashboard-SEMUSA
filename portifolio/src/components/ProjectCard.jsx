import { Lock, Github } from "lucide-react";

function ProjectCard({ project }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition hover:-translate-y-2 hover:border-violet-500">

      <div className="aspect-video bg-zinc-950 flex items-center justify-center">

        <span className="text-zinc-600">
          {project.title} Cover
        </span>

      </div>

      <div className="p-8">

        <div className="flex justify-between items-center">

          <div>

            <h3 className="text-2xl font-bold">
              {project.title}
            </h3>

            <p className="text-violet-400 mt-1">
              {project.subtitle}
            </p>

          </div>

          {project.status === "Private" ? (
            <Lock className="text-violet-400" />
          ) : (
            <Github className="text-violet-400" />
          )}

        </div>

        <p className="text-zinc-400 mt-6 leading-7">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-8">

          {project.technologies.map((tech) => (

            <span
              key={tech}
              className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm"
            >
              {tech}
            </span>

          ))}

        </div>

        <div className="flex justify-between items-center mt-8">

          <span className="text-zinc-500">
            {project.role}
          </span>

          {project.status === "Private" ? (
            <span className="text-violet-400">
              Private
            </span>
          ) : (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="text-violet-400 hover:text-violet-300"
            >
              Repository →
            </a>
          )}

        </div>

      </div>

    </div>
  );
}

export default ProjectCard;