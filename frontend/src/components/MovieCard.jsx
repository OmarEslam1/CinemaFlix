import ImageWithFallback from "./ImageWithFallback";

export default function MovieCard({
  movie,
  favorite,
  manageable = false,
  compact = false,
  className = "",
  onFavoriteToggle,
  onEdit,
  onDelete,
}) {
  return (
    <article
      className={`movie-card ${compact ? "movie-card--wide" : ""} ${className}`.trim()}
    >
      <ImageWithFallback src={movie.image} alt={movie.title} />
      <div className="movie-card__overlay">
        <div className="movie-card__content">
          <h3>{movie.title}</h3>
          <p>{movie.genre}</p>
          <div className="movie-card__actions">
            {onFavoriteToggle ? (
              <button
                type="button"
                className={`icon-button ${favorite ? "icon-button--favorite" : ""}`}
                onClick={() => onFavoriteToggle(movie)}
                aria-label={favorite ? "Remove from favourites" : "Add to favourites"}
              >
                ♥
              </button>
            ) : null}
            {manageable ? (
              <>
                <button type="button" className="icon-button" onClick={() => onEdit(movie)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="icon-button icon-button--danger"
                  onClick={() => onDelete(movie)}
                >
                  Delete
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
