interface HeroRolesType {
  roleText: string;
  showDots: boolean;
}

const HeroRoles = ({ roleText, showDots }: HeroRolesType) => {
  return (
    <div className="mx-auto mb-8 flex h-6 max-w-lg items-center justify-center gap-1 font-mono text-base text-primary-yellow">
      {showDots ? (
        <span className="inline-flex gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary-yellow"
            style={{
              animation: "dotbounce 1s ease-in-out infinite",
              animationDelay: "0s",
            }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary-yellow"
            style={{
              animation: "dotbounce 1s ease-in-out infinite",
              animationDelay: "0.15s",
            }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary-yellow"
            style={{
              animation: "dotbounce 1s ease-in-out infinite",
              animationDelay: "0.3s",
            }}
          />
        </span>
      ) : (
        <>
          <span>{roleText}</span>
          <span className="h-4 w-0.5 shrink-0 animate-pulse bg-primary-yellow" />
        </>
      )}
    </div>
  );
};

export default HeroRoles;
