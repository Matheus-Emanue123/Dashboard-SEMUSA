import { useParams, Link } from "react-router-dom";

import projects from "../projects";

function Project() {
  const { id } = useParams();

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
        <h1 className="text-4xl font-bold">
          Project not found.
        </h1>
      </div>
    );
  }

  return (
    <section className="bg-[#09090B] text-white min-h-screen">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">

        {/* BACK */}

        <Link
          to="/"
          className="text-violet-400 hover:text-violet-300 transition"
        >
          ← Back to Portfolio
        </Link>


        {/* HERO */}

        <div className="mt-10 sm:mt-14">

          <p className="uppercase tracking-[3px] sm:tracking-[6px] text-violet-400 font-semibold text-sm sm:text-base">
            {project.subtitle}
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 break-words">
            {project.title}
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg lg:text-xl leading-7 sm:leading-8 lg:leading-9 mt-6 sm:mt-8 max-w-4xl">
            {project.overview}
          </p>

        </div>


        {/* INFO CARDS */}

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16">

          <div className="rounded-2xl bg-zinc-900 border border-white/10 p-5 sm:p-6">

            <p className="text-violet-400 uppercase text-sm">
              Role
            </p>

            <h3 className="text-lg sm:text-xl mt-3 font-semibold break-words">
              {project.role}
            </h3>

          </div>


          <div className="rounded-2xl bg-zinc-900 border border-white/10 p-5 sm:p-6">

            <p className="text-violet-400 uppercase text-sm">
              Team
            </p>

            <h3 className="text-lg sm:text-xl mt-3 font-semibold break-words">
              {project.team}
            </h3>

          </div>


          <div className="rounded-2xl bg-zinc-900 border border-white/10 p-5 sm:p-6">

            <p className="text-violet-400 uppercase text-sm">
              Status
            </p>

            <h3 className="text-lg sm:text-xl mt-3 font-semibold break-words">
              {project.status}
            </h3>

          </div>

        </div>


        {/* TECHNOLOGIES */}

        <section className="mt-16 sm:mt-24">

          <h2 className="text-3xl font-bold">
            Technologies
          </h2>

          <div className="flex flex-wrap gap-3 mt-8">

            {(project.technologies ?? []).map((tech) => (

              <span
                key={tech}
                className="px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300"
              >
                {tech}
              </span>

            ))}

          </div>

        </section>


        {/* CONTRIBUTIONS */}

        <section className="mt-16 sm:mt-24">

          <h2 className="text-3xl font-bold">
            My Contributions
          </h2>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-5 mt-8 sm:mt-10">

            {(project.contributions ?? []).map((item) => (

              <div
                key={item}
                className="rounded-xl bg-zinc-900 border border-white/10 p-4 sm:p-5"
              >
                {item}
              </div>

            ))}

          </div>

        </section>


        {/* FEATURES */}

        <section className="mt-16 sm:mt-24">

          <h2 className="text-3xl font-bold">
            Main Features
          </h2>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-5 mt-8 sm:mt-10">

            {(project.features ?? []).map((item) => (

              <div
                key={item}
                className="rounded-xl bg-zinc-900 border border-white/10 p-4 sm:p-5"
              >
                {item}
              </div>

            ))}

          </div>

        </section>


        {/* DEVELOPMENT PROCESS */}

        {project.developmentProcess && (

          <section className="mt-16 sm:mt-24">

            <p className="uppercase tracking-[4px] text-violet-400 text-sm font-semibold">
              {project.developmentProcess.label}
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold mt-3">
              {project.developmentProcess.title}
            </h2>

            <p className="text-zinc-400 mt-6 leading-8 max-w-3xl">
              {project.developmentProcess.description}
            </p>


            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-8 sm:mt-12">

              {project.developmentProcess.steps.map((step) => (

                <div
                  key={step.number}
                  className="rounded-2xl bg-zinc-900 border border-white/10 p-5 sm:p-6"
                >

                  <div className="w-10 h-10 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold">
                    {step.number}
                  </div>

                  <h3 className="text-lg font-semibold mt-6">
                    {step.title}
                  </h3>

                  <p className="text-zinc-400 mt-4 leading-7 text-sm">
                    {step.description}
                  </p>

                </div>

              ))}

            </div>


            <div className="mt-6 sm:mt-8 rounded-2xl bg-zinc-900 border border-white/10 p-5 sm:p-8">

              <h3 className="text-lg sm:text-xl font-semibold">
                {project.developmentProcess.collaborationTitle}
              </h3>

              <p className="text-zinc-400 mt-4 leading-8 max-w-4xl">
                {project.developmentProcess.collaborationDescription}
              </p>

            </div>

          </section>

        )}


        {/* CHALLENGES */}

        {project.challenges && (

          <section className="mt-16 sm:mt-24">

            <p className="uppercase tracking-[4px] text-violet-400 text-sm font-semibold">
              {project.challenges.label}
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold mt-3">
              {project.challenges.title}
            </h2>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-10">

              {project.challenges.items.map((item) => (

                <div
                  key={item.title}
                  className="rounded-2xl bg-zinc-900 border border-white/10 p-5 sm:p-7"
                >

                  <h3 className="text-lg sm:text-xl font-semibold">
                    {item.title}
                  </h3>

                  <p className="text-zinc-400 mt-4 leading-7 sm:leading-8">
                    {item.description}
                  </p>

                </div>

              ))}

            </div>

          </section>

        )}


        {/* TESTING */}

        {project.testing && (

          <section className="mt-16 sm:mt-24">

            <p className="uppercase tracking-[4px] text-violet-400 text-sm font-semibold">
              {project.testing.label}
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold mt-3">
              {project.testing.title}
            </h2>

            <p className="text-zinc-400 mt-6 leading-8 max-w-3xl">
              {project.testing.description}
            </p>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-10">

              {project.testing.items.map((item) => (

                <div
                  key={item.title}
                  className="rounded-2xl bg-zinc-900 border border-white/10 p-5 sm:p-7"
                >

                  <h3 className="text-lg sm:text-xl font-semibold">
                    {item.title}
                  </h3>

                  <p className="text-zinc-400 mt-4 leading-7 sm:leading-8">
                    {item.description}
                  </p>

                </div>

              ))}

            </div>

          </section>

        )}


        {/* LESSONS LEARNED */}

        {project.lessons && (

          <section className="mt-16 sm:mt-24">

            <p className="uppercase tracking-[4px] text-violet-400 text-sm font-semibold">
              {project.lessons.label}
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold mt-3">
              {project.lessons.title}
            </h2>

            <div className="mt-8 sm:mt-10 rounded-2xl bg-zinc-900 border border-white/10 p-5 sm:p-8">

              <p className="text-zinc-400 leading-8 max-w-4xl">
                {project.lessons.description}
              </p>

            </div>

          </section>

        )}


        {/* TEAM */}

        {project.teamMembers.length > 0 && (

          <section className="mt-24 pb-20">

            <p className="uppercase tracking-[4px] text-violet-400 text-sm font-semibold">
              Collaboration
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold mt-3">
              Team
            </h2>

            <p className="text-zinc-400 mt-6 leading-8 max-w-3xl">
              {project.title} was developed collaboratively by a team of
              developers. All team members contributed to the development
              and design of the project.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-10">

              {project.teamMembers.map((member) => (

                <div
                  key={member}
                  className="rounded-xl bg-zinc-900 border border-white/10 p-4 sm:p-5"
                >
                  {member}
                </div>

              ))}

            </div>

          </section>

        )}

        {project.teamMembers.length === 0 && (
          <div className="pb-12 sm:pb-20" />
        )}

      </div>

    </section>
  );
}

export default Project;