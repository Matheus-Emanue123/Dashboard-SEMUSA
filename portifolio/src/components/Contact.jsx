import { useState } from "react";
import { motion } from "framer-motion";

function Contact() {
  const [copied, setCopied] = useState(false);

  function copyEmail() {
    navigator.clipboard.writeText("jadegiulia3817@gmail.com");

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <section
      id="contact"
      className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32"
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: .6 }}
        className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 sm:p-10 lg:p-14 text-center"
      >
        <p className="uppercase tracking-[6px] text-violet-400 text-sm">
          Contact
        </p>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-6">
          Let's Work Together
        </h2>

        <p className="text-zinc-400 mt-6 sm:mt-8 leading-7 sm:leading-8 max-w-2xl mx-auto">
          I'm always open to internships, collaborations and
          opportunities to learn and build meaningful software.
        </p>

        <div className="mt-12">

          <p className="text-base sm:text-xl font-medium break-all">
            jadegiulia3817@gmail.com
          </p>

        </div>

        <div className="flex justify-center gap-5 mt-10 flex-wrap">

          <button
            onClick={copyEmail}
            className="px-7 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 transition"
          >
            {copied ? "Copied!" : "Copy Email"}
          </button>

          <a
            href="https://www.linkedin.com/in/jade-souza-352a21333/"
            target="_blank"
            rel="noreferrer"
            className="px-7 py-3 rounded-xl border border-violet-500 hover:bg-violet-500/10 transition"
          >
            LinkedIn
          </a>

        </div>

      </motion.div>
    </section>
  );
}

export default Contact;