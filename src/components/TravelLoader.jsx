export function TravelLoader({ label }) {
  return (
    <div className="travel-loader" role="status" aria-live="polite">
      <div className="travel-globe" aria-hidden="true">
        <div className="travel-globe-lines" />
        <div className="travel-orbit">
          <span className="travel-plane" />
        </div>
      </div>
      <div className="travel-loader-label">{label}</div>
    </div>
  );
}
