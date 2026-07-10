type MonogramProps = {
  size?: "large" | "small";
};

export default function Monogram({
  size = "large",
}: MonogramProps) {
  if (size === "small") {
    return (
      <div className="font-serif text-2xl tracking-tight text-[#B38B59]">
        B<span className="mx-0.5 text-lg">&</span>C
      </div>
    );
  }

  return (
    <div className="mb-12 flex justify-center">
      <div className="relative h-36 w-36">

        <span className="absolute left-0 top-0 font-serif text-8xl text-[#B38B59]">
          B
        </span>

        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-4xl text-[#B38B59]">
          &
        </span>

        <span className="absolute bottom-0 right-0 font-serif text-8xl text-[#B38B59]">
          C
        </span>

      </div>
    </div>
  );
}