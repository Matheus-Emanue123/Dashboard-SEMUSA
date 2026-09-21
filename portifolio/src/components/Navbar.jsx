import { useState } from "react";
import { Menu, X } from "lucide-react";

function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="fixed top-0 left-0 w-full backdrop-blur-xl bg-[#09090B]/70 border-b border-white/5 z-50">
      <nav className="max-w-7xl mx-auto min-h-20 flex justify-between items-center px-4 sm:px-6 lg:px-8">

        <a
          href="#hero"
          onClick={closeMenu}
          className="text-xl sm:text-2xl font-bold tracking-widest text-white"
        >
          JADE
        </a>

        <ul className="hidden md:flex gap-6 lg:gap-10 text-zinc-400">
          <li><a href="#about" className="hover:text-violet-400 transition">About</a></li>
          <li><a href="#projects" className="hover:text-violet-400 transition">Projects</a></li>
          <li><a href="#skills" className="hover:text-violet-400 transition">Skills</a></li>
          <li><a href="#contact" className="hover:text-violet-400 transition">Contact</a></li>
        </ul>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg border border-white/10 text-zinc-200 hover:bg-white/5 transition"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-[#09090B]/95 px-4 pb-5 pt-3">
          <div className="flex flex-col gap-2 text-zinc-300">
            <a href="#about" onClick={closeMenu} className="rounded-lg px-3 py-3 hover:bg-white/5 hover:text-violet-400 transition">About</a>
            <a href="#projects" onClick={closeMenu} className="rounded-lg px-3 py-3 hover:bg-white/5 hover:text-violet-400 transition">Projects</a>
            <a href="#skills" onClick={closeMenu} className="rounded-lg px-3 py-3 hover:bg-white/5 hover:text-violet-400 transition">Skills</a>
            <a href="#contact" onClick={closeMenu} className="rounded-lg px-3 py-3 hover:bg-white/5 hover:text-violet-400 transition">Contact</a>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
