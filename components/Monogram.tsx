import Image from "next/image";

type MonogramProps = {
  size?: "large" | "small";
};

export default function Monogram({ size = "large" }: MonogramProps) {
  return (
    <div
      className={
        size === "large"
          ? "mb-12 flex justify-center"
          : "flex items-center justify-center"
      }
    >
      <Image
        src="/brand/benjamin-chloe-monogram.svg"
        alt=""
        aria-hidden="true"
        width={379}
        height={192}
        loading="eager"
        unoptimized
        className={
          size === "large"
            ? "h-auto w-48 sm:w-52 md:w-56"
            : "h-auto w-[4.75rem] sm:w-20"
        }
      />
    </div>
  );
}
