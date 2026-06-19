export const CARD_COLORS = [
  "#f87171",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#22d3ee",
  "#818cf8",
  "#f472b6",
  "#a3a3a3",
];

interface CardColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function CardColorPicker({ value, onChange }: CardColorPickerProps) {
  return (
    <div className="card-color-picker" role="radiogroup" aria-label="Card color">
      {CARD_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          role="radio"
          aria-checked={color === value}
          aria-label={color}
          className={"color-swatch" + (color === value ? " selected" : "")}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
}
