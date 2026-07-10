import Monogram from "@/components/Monogram";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f8f6f2] px-6 py-24 text-[#181818]">
      <section className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center text-center">
        <Monogram />

        <p className="mb-6 text-xs uppercase tracking-[0.42em] text-neutral-500">
          Page Not Found
        </p>

        <h1 className="font-serif text-5xl leading-none md:text-7xl">
          Nothing Here
        </h1>

        <p className="mt-8 text-sm leading-8 text-neutral-600">
          This page could not be found. Please return to the wedding website.
        </p>

        <a
          href="/"
          className="mt-12 border border-[#181818] px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-[#181818] hover:text-[#f8f6f2]"
        >
          Return Home
        </a>
      </section>
    </main>
  );
}