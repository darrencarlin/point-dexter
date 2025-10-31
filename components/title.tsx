interface Props {
  title: string;
  subtitle?: string;
}

export const Title = ({ title, subtitle }: Props) => {
  return (
    <div className="mb-4">
      <h2 className="mb-2 text-2xl font-bold">{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
};
