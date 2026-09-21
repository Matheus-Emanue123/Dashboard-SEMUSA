import { motion } from "framer-motion";

function About() {
  return (
    <section
      id="about"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32"
    >
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">

        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: .8 }}
          viewport={{ once: true }}
        >

          <p className="uppercase tracking-[6px] text-violet-400 text-sm">
            About Me
          </p>

          <h2 className="text-4xl sm:text-5xl font-bold mt-5 leading-tight">
            Building software with purpose.
          </h2>

          <p className="mt-6 sm:mt-8 text-zinc-400 leading-7 sm:leading-9 text-base sm:text-lg">
            I'm Jade Souza, a Computer Engineering student at CEFET-MG
            passionate about technology and software development.
          </p>

          <p className="mt-5 sm:mt-6 text-zinc-400 leading-7 sm:leading-9 text-base sm:text-lg">
            I enjoy creating applications that solve real-world problems,
            learning modern technologies and continuously improving my
            programming and problem-solving skills.
          </p>

          <p className="mt-5 sm:mt-6 text-zinc-400 leading-7 sm:leading-9 text-base sm:text-lg">
            Currently, I'm exploring Software Engineering, Artificial
            Intelligence and Cybersecurity while developing full-stack
            applications and academic projects.
          </p>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: .8 }}
          viewport={{ once: true }}
          className="grid gap-6"
        >

          <div className="rounded-3xl border border-white/10 p-6 sm:p-8 bg-zinc-900/50">

            <h3 className="text-violet-400 uppercase text-sm tracking-[4px]">
              Education
            </h3>

            <h2 className="text-2xl font-bold mt-3">
              Computer Engineering
            </h2>

            <p className="text-zinc-400 mt-2">
              CEFET-MG
            </p>

          </div>

          <div className="rounded-3xl border border-white/10 p-6 sm:p-8 bg-zinc-900/50">

            <h3 className="text-violet-400 uppercase text-sm tracking-[4px]">
              Current Focus
            </h3>

            <p className="text-zinc-400 mt-3">
              Software Development
            </p>

            <p className="text-zinc-400 mt-2">
              Artificial Intelligence
            </p>

            <p className="text-zinc-400 mt-2">
              Cybersecurity
            </p>

          </div>

          <div className="rounded-3xl border border-white/10 p-6 sm:p-8 bg-zinc-900/50">

            <h3 className="text-violet-400 uppercase text-sm tracking-[4px]">
              Location
            </h3>

            <p className="text-zinc-400 mt-3">
              Minas Gerais, Brazil
            </p>

          </div>

        </motion.div>

      </div>
    </section>
  );
}

export default About;