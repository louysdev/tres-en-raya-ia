export const Square = ({
  children,
  isSelected,
  updateBoard,
  index,
  isBlocked,
}) => {
  const className = `square ${isSelected ? "is-selected" : ""}`;

  const handleClick = () => {
    isBlocked ? null : updateBoard(index);
  };

  return (
    <div onClick={handleClick} className={className}>
      {children}
    </div>
  );
};
