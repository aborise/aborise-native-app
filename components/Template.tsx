type TemplateProps = {
  children: string | JSX.Element | JSX.Element[] | (() => JSX.Element) | null;
  vif: boolean | null | undefined | string | number | object;
};

export const Template: React.FC<TemplateProps> = ({ vif, children }) => {
  return <>{vif ? children : null}</>;
};
