interface Props {
  title: string;
  subtitle?: string;
}

export const Title = ({ title, subtitle }: Props) => {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
};
