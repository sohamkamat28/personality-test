export default function Loading() {
  return (
    <div className="app-loading" role="status" aria-live="polite">
      <div className="app-loading__panel">
        <div className="app-loading__mark" aria-hidden="true" />
        <strong>Personality test</strong>
        <span>Preparing your experience...</span>
      </div>
    </div>
  );
}
