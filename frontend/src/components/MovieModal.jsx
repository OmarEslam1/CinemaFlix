const DEFAULT_FORM = {
  title: "",
  image: "",
  description: "",
  genre: "",
  sections: ["my_movies"],
  is_featured: false,
};

export function getInitialMovieForm(movie) {
  if (!movie) {
    return DEFAULT_FORM;
  }

  return {
    title: movie.title,
    image: movie.image,
    description: movie.description,
    genre: movie.genre,
    sections: movie.sections?.length ? movie.sections : ["my_movies"],
    is_featured: Boolean(movie.is_featured),
  };
}

export default function MovieModal({
  mode,
  value,
  loading,
  error,
  onChange,
  onToggleSection,
  onSubmit,
  onClose,
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose}>
          ×
        </button>
        <h2>{mode === "edit" ? "Edit Movie" : "Add New Movie"}</h2>

        <form className="modal-form" onSubmit={onSubmit}>
          <label className="modal-field">
            <span>Title</span>
            <input
              name="title"
              value={value.title}
              onChange={onChange}
              placeholder="Enter movie title"
              required
            />
          </label>

          <label className="modal-field">
            <span>Image URL or Path</span>
            <input
              name="image"
              value={value.image}
              onChange={onChange}
              placeholder="https://example.com/poster.jpg or /images/Card 1.png"
              required
            />
          </label>

          <label className="modal-field">
            <span>Genre</span>
            <input
              name="genre"
              value={value.genre}
              onChange={onChange}
              placeholder="Sci-Fi Thriller"
              required
            />
          </label>

          <label className="modal-field">
            <span>Description</span>
            <textarea
              name="description"
              value={value.description}
              onChange={onChange}
              placeholder="Write a short movie description"
              rows={5}
              required
            />
          </label>

          <div className="modal-field">
            <span>Show In</span>
            <div className="chip-group">
              {[
                ["daily", "Daily Movies"],
                ["trending", "Trending Now"],
                ["my_movies", "My Movies"],
              ].map(([section, label]) => (
                <button
                  key={section}
                  type="button"
                  className={`chip ${value.sections.includes(section) ? "chip--active" : ""}`}
                  onClick={() => onToggleSection(section)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <label className="check-row check-row--featured">
            <input
              type="checkbox"
              name="is_featured"
              checked={value.is_featured}
              onChange={onChange}
            />
            <span>Use this movie as the featured hero</span>
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Saving..." : "Save Movie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
