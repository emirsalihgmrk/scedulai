export default function Logo() {
  return (
    <div
      data-slot="logo"
      className="inline-flex items-baseline text-xl leading-none font-normal tracking-wider text-brand-ink"
    >
      scedu
      <svg
        viewBox="0 0 100 70"
        aria-hidden
        className="mx-[0.1em] h-[0.7em] w-[1em] overflow-visible"
      >
        <path
          d="M4 0 V70 M20 70 L50 0 L80 70 M96 0 V70"
          fill="none"
          className="stroke-brand-mark"
          strokeWidth="8"
          strokeLinejoin="miter"
          strokeMiterlimit="6"
        />
      </svg>
    </div>
  );
}
