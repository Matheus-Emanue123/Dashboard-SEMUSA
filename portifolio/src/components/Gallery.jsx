import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Gallery({ images }) {
  const [current, setCurrent] = useState(0);

  function next() {
    setCurrent((current + 1) % images.length);
  }

  function previous() {
    setCurrent((current - 1 + images.length) % images.length);
  }

  const image = images[current];

  return (
    <section className="mt-24">

      <h2 className="text-3xl font-bold mb-10">
        Gallery
      </h2>

      <div className="rounded-3xl overflow-hidden border border-white/10 bg-zinc-900">

        {/* Barra tipo macOS */}

        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">

          <div className="w-3 h-3 rounded-full bg-red-500"></div>

          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>

          <div className="w-3 h-3 rounded-full bg-green-500"></div>

        </div>

        <img
          src={image.image}
          alt={image.title}
          className="w-full object-cover"
        />

      </div>

      <div className="flex justify-between items-center mt-8">

        <button
          onClick={previous}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 hover:border-violet-500 transition"
        >
          <ChevronLeft size={20} />

          Previous
        </button>

        <div className="text-center">

          <p className="text-violet-400 font-semibold text-xl">
            {image.title}
          </p>

          <p className="text-zinc-400 mt-3 max-w-xl">
            {image.description}
          </p>

          <p className="text-zinc-600 mt-5">
            {current + 1} / {images.length}
          </p>

        </div>

        <button
          onClick={next}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 hover:border-violet-500 transition"
        >
          Next

          <ChevronRight size={20} />

        </button>

      </div>

    </section>
  );
}

export default Gallery;