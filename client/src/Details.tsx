import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Rating } from "@smastrom/react-rating";
import { UserContext } from "./UserContext";
import MUForm from "./MUForm";

interface Movie {
  movie_id: number;
  user_id: number;
  title: string;
  img: string;
  desc: string;
  release_yr: number;
  director: string;
  length: number; // in minutes
  producer: string;
  rating: number; // e.g., 4.75
  genres: string[]; // array of genres
  user: string; // name of the user
  rr: {
    rr_id: number;
    user_id: number;
    user: string;
    review: string;
    rating: number;
  }[]; // array of reviews
}

const Details = () => {
  const context = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  // console.log();
  const [dataObj, setDataObj] = useState<Movie | null>(null);
  const [rating, setRating] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [reviewTxt, setReviewTxt] = useState("");
  useEffect(() => {
    fetch("http://localhost:3000/movies/" + location.pathname.slice(9))
      .then((res) => res.json())
      .then((data: Movie) => setDataObj(data));
  }, [refresh]);
  function handleSubmit(event: { target: any; preventDefault: () => void }) {
    event.preventDefault();
    // console.log({movie_id: dataObj?.movie_id, user_id: context?.user?.user_id, rating: rating, review: event.target.review.value});
    const checkerValue = dataObj?.rr.find(
      (x) => x.user_id == context?.user?.user_id
    );
    if (checkerValue) {
      fetch("http://localhost:3000/rrs/" + checkerValue.rr_id, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          rating: rating,
          review: event.target.review.value,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.rr_id) {
            setRating(0);
            event.target.review.value = "";
            setRefresh(refresh + 1);
            document.getElementById("updateForm")?.classList.add("hidden");
            document
              .getElementById("updateFormClose")
              ?.classList.remove("hidden");
          }
        });
    } else {
      fetch("http://localhost:3000/rrs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          movie_id: dataObj?.movie_id,
          user_id: context?.user?.user_id,
          rating: rating,
          review: event.target.review.value,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.rr_id) {
            setRating(0);
            event.target.review.value = "";
            document.getElementById("my_modal_1")?.classList.add("modal-open");
            setRefresh(refresh + 1);
          }
        });
    }
  }
  function closeModal() {
    document.getElementById("my_modal_1")?.classList.remove("modal-open");
  }
  function closeModal_1() {
    document.getElementById("my_modal_2")?.classList.remove("modal-open");
    document.getElementById("updateForm")?.classList.remove("hidden");
    document.getElementById("updateFormClose")?.classList.add("hidden");
  }
  function handleDelete() {
    document.getElementById("my_modal_5")?.classList.remove("modal-open");
    fetch("http://localhost:3000/movies/" + dataObj?.movie_id, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.deleted) {
          document.getElementById("my_modal_3")?.classList.add("modal-open");
        }
      });
  }
  function handleUpdate() {
    document.getElementById("my_modal_4")?.classList.add("modal-open");
    // fetch('http://localhost:3000/movies/' + dataObj?.movie_id, {
    //   method: 'DELETE'
    // })
    // .then(res => res.json())
    // .then(data => {
    //   if (data.deleted) {
    //     document.getElementById('my_modal_3')?.classList.add('modal-open');
    //   }
    // })
  }
  function closeModal_3() {
    document.getElementById("my_modal_3")?.classList.remove("modal-open");
    navigate("/user");
  }
  // console.log();
  return (
    <section className="bg-black text-white py-10">
      <div className="flex justify-around items-center">
        <div className="w-2/5">
          <h2 className="text-5xl mb-4">{dataObj?.title}</h2>
          {dataObj?.genres.map((y) => (
            <small
              key={y}
              className="mr-2 border px-2 p-1 text-blue-300 border-blue-300 rounded-3xl"
            >
              {y}
            </small>
          ))}
          <p className="text-slate-200 mt-3">
            {dataObj?.release_yr} . {dataObj?.length}min
          </p>
          <p className="mb-8">
            <svg
              className="inline mb-1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
              width="15"
            >
              <path
                fill="#f5c518"
                d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
              />
            </svg>
            <span className="text-slate-300"> {dataObj?.rating || 0}</span>
          </p>

          {/* <p className='mt-6 mb-2 text-lg'><span className='font-bold me-1'>Genre</span> </p> */}
          <p className="text-lg my-1">
            <span className="font-bold me-1">Director :</span>{" "}
            <span className="text-blue-300">{dataObj?.director}</span>
          </p>
          <p className="text-lg my-1">
            <span className="font-bold me-1">Producer :</span>{" "}
            <span className="text-blue-300">{dataObj?.producer}</span>
          </p>
          <p className="text-lg mb-6">
            <span className="font-bold me-1">Created By :</span>{" "}
            <span className="text-blue-300">{dataObj?.user}</span>
          </p>
          <p className="mb-4">{dataObj?.desc}</p>
          {dataObj?.user_id == context?.user?.user_id && (
            <span>
              <button
                onClick={handleUpdate}
                className="btn bg-transparent btn-nav-l text-white min-h-0 h-auto py-3 rounded-full"
                type="button"
              >
                <i className="fa-regular fa-pen-to-square"></i> Edit
              </button>{" "}
              &nbsp;{" "}
              <button
                onClick={() =>
                  document
                    .getElementById("my_modal_5")
                    ?.classList.add("modal-open")
                }
                className="btn btn-d-del btn-error text-white min-h-0 h-auto py-3 rounded-full"
                type="button"
              >
                <i className="fa-solid fa-trash"></i> Delete
              </button>
            </span>
          )}
          <dialog id="my_modal_1" className="modal">
            <div className="modal-box">
              <p className="py-4 text-black font-medium text-center">
                Rating and review posted!
              </p>
              <div className="">
                <form method="dialog" className="text-center">
                  <button className="btn" onClick={closeModal}>
                    Close
                  </button>
                </form>
              </div>
            </div>
          </dialog>
        </div>
        <img
          src={"http://localhost:3000" + dataObj?.img}
          alt="poster"
          className="poster-img-1 rounded-xl"
        />
      </div>
      {/* <hr className="my-8 w-4/5 mx-auto" /> */}
      <div className="bg-slate-900 mt-20 px-4 py-10 rounded-3xl mx-28">
        <h3 className="text-3xl text-center">User Reviews</h3>
        {context?.user &&
          !dataObj?.rr.find((x) => x.user_id == context?.user?.user_id) && (
            <>
              <h4 className="text-2xl my-3 ml-32">Rate and Review</h4>
              <form name="rr" className="mb-10" onSubmit={handleSubmit}>
                <Rating
                  style={{ maxWidth: 180, marginLeft: "120px" }}
                  value={rating}
                  onChange={setRating}
                />
                <textarea
                  required
                  placeholder="Write your review"
                  name="review"
                  className="textarea textarea-bordered textarea-md w-4/5 ml-32 bg-slate-700 text-white mt-4 my-2"
                ></textarea>
                <br />
                <button
                  type="submit"
                  className="btn bg-transparent btn-nav-l text-white min-h-0 h-auto py-3 rounded-full ml-32"
                >
                  Submit
                </button>
              </form>
            </>
          )}
        {dataObj?.rr.map((x) => (
          <article
            key={x.rr_id}
            className="flex w-3/4 mx-auto justify-between bg-slate-700 text-white my-6 p-4 rounded-md"
          >
            <div className="w-11/12">
              <p className="text-justify mb-3">{x.review}</p>
              <b>{x.user}</b>
            </div>
            <div>
              <article className="flex">
                <svg
                  className="inline"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512"
                  width="15"
                >
                  <path
                    fill="#f5c518"
                    d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
                  />
                </svg>
                <span className="ml-1"> {x?.rating || 0}</span>
              </article>
              {x.user_id == context?.user?.user_id && (
                <button
                  onClick={() => {
                    setRating(x?.rating);
                    setReviewTxt(x.review);
                    document
                      .getElementById("my_modal_2")
                      ?.classList.add("modal-open");
                  }}
                  type="button"
                  className="btn min-h-0 h-auto p-1 mt-4"
                >
                  Edit
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      <dialog id="my_modal_2" className="modal">
        <div className="modal-box">
          <form
            name="rr"
            method="dialog"
            className="text-center"
            onSubmit={handleSubmit}
          >
            <section id="updateForm">
              <h4 className="text-center text-black text-2xl my-4">
                Update Rating and Review
              </h4>
              <Rating
                style={{ maxWidth: 180, margin: "auto" }}
                value={rating}
                onChange={setRating}
              />
              <textarea
                defaultValue={reviewTxt}
                placeholder="Write your review"
                name="review"
                className="textarea textarea-bordered textarea-md w-full max-w-xs text-black my-2"
              ></textarea>
              <br />
              <button type="submit" className="btn">
                Submit
              </button>{" "}
              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("my_modal_2")
                    ?.classList.remove("modal-open");
                }}
                className="btn"
              >
                Cancel
              </button>
            </section>
            <section className="hidden" id="updateFormClose">
              <h4 className="text-center text-black text-2xl my-4">Updated!</h4>
              <button type="button" className="btn" onClick={closeModal_1}>
                Close
              </button>
            </section>
          </form>
        </div>
      </dialog>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box text-center">
          <h4 className="text-red-500 text-2xl my-4">Deleted!</h4>
          <button type="button" className="btn" onClick={closeModal_3}>
            Close
          </button>
        </div>
      </dialog>
      <dialog id="my_modal_5" className="modal">
        <div className="modal-box text-center">
          <h4 className="text-black text-2xl mb-4">Delete this item?</h4>
          <button
            type="button"
            className="btn text-red-500"
            onClick={handleDelete}
          >
            Confirm
          </button>{" "}
          &nbsp; &nbsp;{" "}
          <button
            type="button"
            className="btn"
            onClick={() =>
              document
                .getElementById("my_modal_5")
                ?.classList.remove("modal-open")
            }
          >
            Cancel
          </button>
        </div>
      </dialog>
      <dialog id="my_modal_4" className="modal">
        <div className="modal-box text-black">
          <article id="my_modal_4A1" className="">
            <MUForm setRefresh={setRefresh} mId={dataObj?.movie_id} />
          </article>
          <article id="my_modal_4A2" className="hidden text-center">
            <h4 className="text-black text-2xl my-4">Updated!</h4>
            <button
              type="button"
              className="btn"
              onClick={() => {
                document
                  .getElementById("my_modal_4")
                  ?.classList.remove("modal-open");
                document
                  .getElementById("my_modal_4A2")
                  ?.classList.add("hidden");
                document
                  .getElementById("my_modal_4A1")
                  ?.classList.remove("hidden");
              }}
            >
              Close
            </button>
          </article>
        </div>
      </dialog>
    </section>
  );
};

export default Details;
