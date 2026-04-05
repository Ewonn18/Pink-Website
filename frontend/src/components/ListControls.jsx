export default function ListControls({
  showControls = false,
  canLoadMore = false,
  canShowLess = false,
  onLoadMore,
  onShowLess,
  buttonStyle,
  ghostButtonStyle,
}) {
  if (!showControls) return null;

  return (
    <div
      style={{
        marginTop: "22px",
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      {canLoadMore ? (
        <button type="button" onClick={onLoadMore} style={buttonStyle}>
          Load More
        </button>
      ) : null}

      {canShowLess ? (
        <button type="button" onClick={onShowLess} style={ghostButtonStyle}>
          Show Less
        </button>
      ) : null}
    </div>
  );
}
