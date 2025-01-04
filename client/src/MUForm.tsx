import React, { useState } from 'react';


interface MovieData {
  desc?: string;
  release_yr?: number;
  director?: string;
  length?: number;
  producer?: string;
}



interface MUFormProps {
  setRefresh: React.Dispatch<React.SetStateAction<number>>;
  mId: number | undefined; // Add mId to the props interface
}
  

const MUForm: React.FC<MUFormProps> = ({ setRefresh, mId }) => {

  const [formData, setFormData] = useState<Partial<MovieData>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedValue =
        name === 'release_yr' || name === 'length' ? Number(value) : value;

      return { ...prev, [name]: updatedValue };
    });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
        // Filter out empty fields
        const filteredData = Object.entries(formData).reduce((acc, [key, value]) => {
          if (value !== '' && value !== undefined) {
            (acc as any)[key] = value; // Type assertion for flexibility
          }
          return acc;
        }, {} as Partial<MovieData>);
    
        // console.log(filteredData); // Log only changed or non-empty fields
    fetch('http://localhost:3000/movies/' + mId, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(filteredData)
      })
    .then(res => res.json())
    .then(data => {
        if (data.movie_id) {
            setFormData({});
              document.getElementById('my_modal_4A1')?.classList.add('hidden');
              document.getElementById('my_modal_4A2')?.classList.remove('hidden');
              setRefresh((prev) => prev + 1);
        }
    })
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Movie Data Update Form</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          name="desc"
          value={formData.desc || ''}
          onChange={handleInputChange}
          placeholder="Description"
          className="textarea textarea-bordered w-full"
        />
        <input
          type="number"
          name="release_yr"
          value={formData.release_yr || ''}
          onChange={handleInputChange}
          placeholder="Release Year"
          className="input input-bordered w-full"
        />
        <input
          type="text"
          name="director"
          value={formData.director || ''}
          onChange={handleInputChange}
          placeholder="Director"
          className="input input-bordered w-full"
        />
        <input
          type="number"
          name="length"
          value={formData.length || ''}
          onChange={handleInputChange}
          placeholder="Length (minutes)"
          className="input input-bordered w-full"
        />
        <input
          type="text"
          name="producer"
          value={formData.producer || ''}
          onChange={handleInputChange}
          placeholder="Producer"
          className="input input-bordered w-full"
        />
        <button type="submit" className="btn w-full">
          Submit
        </button>
        <button type="button" className="btn btn-block" onClick={() => {
          document.getElementById('my_modal_4')?.classList.remove('modal-open');
        }}>Cancel</button>
      </form>
    </div>
  );
};

export default MUForm;
