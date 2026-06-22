import { BUILTIN_BACKGROUNDS } from "../assets/backgrounds";
import type { useBackground } from "../state/useBackground";
import { ErrorBanner } from "./ErrorBanner";

interface BackgroundPickerProps {
  background: ReturnType<typeof useBackground>;
}

export function BackgroundPicker({ background }: BackgroundPickerProps) {
  const { selection, error, selectBuiltin, browseForImage, retry } = background;

  return (
    <div className="background-picker">
      <h2>Background</h2>
      {error && <ErrorBanner message={error} onRetry={retry} />}
      <div className="background-picker-gallery">
        {BUILTIN_BACKGROUNDS.map((bg) => (
          <button
            key={bg.id}
            type="button"
            className={
              "background-thumb" +
              (selection?.type === "builtin" && selection.id === bg.id ? " selected" : "")
            }
            style={{ backgroundImage: `url("${bg.url}")` }}
            aria-label={bg.label}
            onClick={() => selectBuiltin(bg.id)}
          />
        ))}
        <button type="button" className="background-thumb-browse" onClick={browseForImage}>
          Browse…
        </button>
      </div>
    </div>
  );
}
