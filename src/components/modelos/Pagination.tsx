interface PaginationProps {
  count?: number;
}
const Pagination = ({ count }: PaginationProps) => {
  return <p>{count}</p>;
};

export default Pagination;
