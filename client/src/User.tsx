import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { Link } from "react-router";

// Define the type for a movie item
interface Movie {
    movie_id: number;
    user_id: number;
    title: string;
    img: string;
    desc: string;
    release_yr: number;
    director: string;
    length: number;
    producer: string;
    averageRating: number;
    genres: { genre: string }[];
  }

const User = () => {
    const context = useContext(UserContext);
      const [data, setData] = useState<Movie[]>([]);
      useEffect(() => {
        if (context?.user) {
          fetch('http://localhost:3000/moviesFromUser/' + context?.user?.user_id)
          .then((res) => res.json())
          .then((data: Movie[]) => setData(data))
        }
      }, [context?.listRefresh, context?.user]);
      // console.log();

    return (
        <div className="bg-black text-white py-4 min-h-screen">
            <h4 className="text-2xl txt-outline-c text-center mb-6">Your Movies</h4>
            <div className='grid grid-cols-4 gap-6 w-9-10 mx-auto'>
        {data.map((x) => (
          <Link to={`/details/${x.movie_id}`} key={x.movie_id}>
          <div className="card shadow-xl">
<figure>
  <img className='poster-img' src={'http://localhost:3000' + x.img} alt="poster" />
</figure>
<div className="">
<h2 className="card-title block text-white">{x.title}</h2>
<article className='flex justify-between'>
  <p className='text-slate-500'>{x.release_yr}</p>
<p>
    <svg className='inline mb-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="15">
      <path fill="#f5c518" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
    </svg>
    <span className='text-slate-300'> {x.averageRating || 0}</span>
  </p>
</article>

  <small className='text-white'>Genre : {x.genres.map((y) => (
    <span key={y.genre} className="mx-1 border px-2 p-1 text-blue-400 border-blue-400 rounded-3xl">
      {y.genre}
    </span>
  ))}</small>
  <div className="card-actions mt-4 justify-center">
    
  </div>
</div>
</div>
</Link>
        ))}

      </div>
        </div>
    );
};

export default User;