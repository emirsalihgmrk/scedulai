export function Logo() {
  return (
    <div className="inline-flex items-baseline font-normal text-xl leading-none tracking-wider  text-[#1b1a18]">
      scedu
      <svg
        viewBox="0 0 100 70"
        style={{
          height: "0.7em",
          width: "1em",
          margin: "0 0.1em",
          overflow: "visible",
        }}
      >
        <path
          d="M4 0 V70 M20 70 L50 0 L80 70 M96 0 V70"
          fill="none"
          stroke="#5f6b3a"
          stroke-width="8"
          stroke-linejoin="miter"
          stroke-miterlimit="6"
        />
      </svg>
    </div>
  );
}
