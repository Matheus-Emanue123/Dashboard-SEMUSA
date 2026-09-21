import { Link } from "react-router-dom";

function ProjectHero({ project }) {
  return (
    <section className="pb-12 sm:pb-20 border-b border-white/10">

      <Link
        to="/"
        className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition"
      >
        ← Back to Portfolio
      </Link>

      <div className="mt-8 sm:mt-12">

        <p className="uppercase tracking-[3px] sm:tracking-[6px] text-violet-400 font-semibold text-sm sm:text-base">
          {project.subtitle}
        </p>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mt-5 break-words">
          {project.title}
        </h1>

        <p className="text-zinc-400 text-base sm:text-lg lg:text-xl leading-7 sm:leading-8 lg:leading-9 max-w-3xl mt-6 sm:mt-8">
          {project.overview}
        </p>

      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3 mt-8 sm:mt-12">

        {project.technologies.map((tech) => (

          <span
            key={tech}
            className="px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300"
          >
            {tech}
          </span>

        ))}

      </div>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16">

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-6">

          <p className="text-violet-400 uppercase text-sm tracking-wider">
            Role
          </p>

          <h3 className="mt-3 text-xl font-semibold">
            {project.role}
          </h3>

        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-6">

          <p className="text-violet-400 uppercase text-sm tracking-wider">
            Team
          </p>

          <h3 className="mt-3 text-xl font-semibold">
            {project.team}
          </h3>

        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-6">

          <p className="text-violet-400 uppercase text-sm tracking-wider">
            Status
          </p>

          <h3 className="mt-3 text-xl font-semibold">
            {project.status}
          </h3>

        </div>

      </div>

    </section>
  );
}

export default ProjectHero;