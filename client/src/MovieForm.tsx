import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router";
import { UserContext } from "./UserContext";

interface MovieData {
  title: string;
  img: string;
  desc: string;
  release_yr: number;
  director: string;
  length: number;
  producer: string;
  genre: string[];
}

interface Genre {
  genre_id: number;
  genre: string;
}

interface MovieFormProps {
  setHomeRefresh: React.Dispatch<React.SetStateAction<number>>;
  setListRefresh: React.Dispatch<React.SetStateAction<number>>;
}

const MovieForm: React.FC<MovieFormProps> = ({ setHomeRefresh, setListRefresh }) => {
  const content = useContext(UserContext);
  const location = useLocation();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [formData, setFormData] = useState<MovieData>({
    title: "",
    img: "",
    desc: "",
    release_yr: new Date().getFullYear(),
    director: "",
    length: 0,
    producer: "",
    genre: [],
  });

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [newGenre, setNewGenre] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/genres')
    .then((res) => res.json())
    .then((data: Genre[]) => setGenres(data))
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!selectedGenres.includes(value)) {
      setSelectedGenres(prev => [...prev, value]);
    }
  };

  const handleRemoveGenre = (genre: string) => {
    setSelectedGenres(prev => prev.filter(g => g !== genre));
  };

  const handleAddNewGenre = () => {
    if (newGenre.trim() && !genres.find((x) => x.genre === newGenre)) {
      fetch("http://localhost:3000/genres", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ genre: newGenre }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.genre_id) {
            setNewGenre("");
            if (location.pathname == '/') {
              setHomeRefresh((prev) => prev + 1);
            }
            else if (location.pathname == '/user') {
              setListRefresh((prev) => prev + 1);
            }
          }
        });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCancelImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (imageFile) {
      // Upload image first
      const formDataImage = new FormData();
      formDataImage.append("image", imageFile);

      try {
        const imageResponse = await fetch("http://localhost:3000/upload", {
          method: "POST",
          body: formDataImage,
        });

        const imageData = await imageResponse.json();

        if (imageData.filePath) {
          // Update form data with image URL and selected genres
          const updatedFormData = { ...formData, img: imageData.filePath, genre: selectedGenres };
          // console.log({ user_id: content?.user?.user_id, ...updatedFormData });
          // Submit movie data
          const movieResponse = await fetch("http://localhost:3000/movies", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ user_id: content?.user?.user_id, ...updatedFormData }),
          });

          const movieData = await movieResponse.json();
          if (movieData.movie.movie_id) {
            setFormData({
              title: "",
              img: "",
              desc: "",
              release_yr: new Date().getFullYear(),
              director: "",
              length: 0,
              producer: "",
              genre: [],
            });
            setImageFile(null);
            setImagePreview(null);
            setSelectedGenres([]);
            if (location.pathname == '/') {
              setHomeRefresh((prev) => prev + 1);
            }
            else if (location.pathname == '/user') {
              setListRefresh((prev) => prev + 1);
            }
            document.getElementsByTagName('section')[1].classList.add('hidden');
            document.getElementsByTagName('section')[0].classList.remove('hidden');
          }
        }
      } catch (error) {
        console.error("Error during upload:", error);
      }
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Movie Data Form</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Movie Title"
          className="input input-bordered w-full"
        />

        <textarea
          name="desc"
          value={formData.desc}
          onChange={handleInputChange}
          placeholder="Description"
          className="textarea textarea-bordered w-full"
        />

        <input
          type="number"
          name="release_yr"
          value={formData.release_yr}
          onChange={handleInputChange}
          placeholder="Release Year"
          className="input input-bordered w-full"
        />

        <input
          type="text"
          name="director"
          value={formData.director}
          onChange={handleInputChange}
          placeholder="Director"
          className="input input-bordered w-full"
        />

        <input
          type="number"
          name="length"
          value={formData.length}
          onChange={handleInputChange}
          placeholder="Length (minutes)"
          className="input input-bordered w-full"
        />

        <input
          type="text"
          name="producer"
          value={formData.producer}
          onChange={handleInputChange}
          placeholder="Producer"
          className="input input-bordered w-full"
        />

        <div className="space-y-2">
          <select
            onChange={handleGenreChange}
            className="select select-bordered w-full"
          >
            <option disabled>Select a genre</option>
            {genres.map((genre) => (
              <option key={genre.genre_id} value={genre.genre}>
                {genre.genre}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            {selectedGenres.map((genre) => (
              <div key={genre} className="badge badge-ghost gap-1">
                {genre}
                <button
                  type="button"
                  onClick={() => handleRemoveGenre(genre)}
                  className="btn btn-ghost btn-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newGenre}
            onChange={(e) => setNewGenre(e.target.value)}
            placeholder="Add new genre"
            className="input input-bordered flex-1"
          />
          <button
            type="button"
            onClick={handleAddNewGenre}
            className="btn"
          >
            Add
          </button>
        </div>

        {/* Image Upload Section */}
        {!imageFile && (
          <label className="btn btn-block">
            Select Image
            <input
              type="file"
              className="hidden"
              onChange={handleImageChange}
              accept="image/*"
            />
          </label>
        )}

        {/* Preview Section */}
        {imagePreview && (
          <div className="card w-96 bg-base-100 shadow-xl">
            <figure>
              <img src={imagePreview} alt="Preview" className="rounded-t-lg max-h-60 object-cover" />
            </figure>
            <div className="card-body">
              <h2 className="card-title">Image Preview</h2>
              <div className="card-actions justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-error text-white"
                  onClick={handleCancelImage}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="btn w-full">
          Submit
        </button>
        <button type="button" className="btn btn-block" onClick={() => {
          document.getElementById('my_modal_nav')?.classList.remove('modal-open');
        }}>Cancel</button>
      </form>
    </div>
  );
};

export default MovieForm;

