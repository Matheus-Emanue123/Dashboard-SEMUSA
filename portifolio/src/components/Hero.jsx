import { motion } from "framer-motion";
import avatar from "../assets/avatar.png";

function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center bg-[#09090B] px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pb-20"
    >
      <div className="max-w-7xl mx-auto w-full">

        <div className="grid lg:grid-cols-[360px_1fr] xl:grid-cols-[420px_1fr] gap-10 lg:gap-12 items-center">

          {/* Lado Esquerdo */}

          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .8 }}
            className="flex flex-col items-center lg:items-start"
          >

            <div className="relative">

              <div className="absolute inset-0 bg-violet-600 blur-[120px] opacity-30 rounded-full"></div>

              <img
                src={avatar}
                alt="Avatar"
                className="relative w-52 sm:w-64 lg:w-72 xl:w-80 rounded-full border-4 border-violet-500"
              />

            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mt-7 sm:mt-10 leading-none text-center lg:text-left">
              <span className="text-white">Jade</span>{" "}
              <span className="text-violet-400">Souza</span>
            </h1>

          </motion.div>

          {/* Lado Direito */}

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .8 }}
          >

            <p className="uppercase tracking-[6px] text-violet-400 mb-4">
              Hello, I'm
            </p>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">

              Computer
              <br />
              Engineering
              <br />
              Student

            </h2>

            <p className="text-zinc-400 text-base sm:text-lg lg:text-xl leading-7 sm:leading-8 lg:leading-9 mt-6 sm:mt-8 max-w-xl">

              Passionate about software engineering,
              backend development and continuously improving my
              programming and problem-solving skills.

            </p>

            <div className="flex gap-3 sm:gap-5 mt-8 sm:mt-12 flex-wrap">

              <a
                href="#contact"
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-violet-600 hover:bg-violet-500 transition"
              >
                Contact Me
              </a>

              <a
                href="https://github.com/Jade-Souza"
                target="_blank"
                rel="noreferrer"
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl border border-violet-500 hover:bg-violet-500/10 transition"
              >
                GitHub
              </a>

            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}

export default Hero;