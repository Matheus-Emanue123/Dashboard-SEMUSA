function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">

        <div>
          <h3 className="text-xl font-semibold">
            Jade Souza
          </h3>

          <p className="text-zinc-500 mt-2">
            Computer Engineering Student
          </p>
        </div>

        <div className="flex items-center gap-6 text-zinc-400">

          <a
            href="https://github.com/Jade-Souza"
            target="_blank"
            rel="noreferrer"
            className="hover:text-violet-400 transition"
          >
            GitHub
          </a>

          <a
            href="https://www.linkedin.com/in/jade-souza-352a21333/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-violet-400 transition"
          >
            LinkedIn
          </a>

          <a
            href="mailto:jadegiulia3817@gmail.com"
            className="hover:text-violet-400 transition"
          >
            Email
          </a>

        </div>

      </div>

      <div className="border-t border-white/10">

        <p className="text-center text-zinc-600 py-6 text-sm">
          © {new Date().getFullYear()} Jade Souza. Built with React, Vite and Tailwind CSS.
        </p>

      </div>
    </footer>
  );
}

export default Footer;