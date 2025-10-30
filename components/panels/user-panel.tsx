import { Title } from "../title";

interface Props {
  id: string;
}

export const UserPanel = ({ id }: Props) => {
  return (
    <Title title="User Controlled Panel" subtitle="User actions will go here" />
  );
};
