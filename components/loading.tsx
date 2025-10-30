interface Props {
  text?: string;
}

export const Loading = ({ text = "Loading..." }: Props) => {
  return (
    <div className="max-w-md mx-auto mt-6">
      <p>{text}</p>
    </div>
  );
};
