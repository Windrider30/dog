import { useState } from 'react';
import axios from 'axios';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch breed data from The Dog API
      const dogApiResponse = await axios.get(
        `https://api.thedogapi.com/v1/breeds/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'x-api-key': 'live_QUc1jYKWDDpRFH2HdTNfVZMVLtdWN5R7W5X5K3WdLOERYoUbiuK2cPnKxhTUvdeP'
          }
        }
      );

      // Fetch images from Pixabay for each breed
      const breeds = await Promise.all(
        dogApiResponse.data.map(async (breed) => {
          try {
            const pixabayResponse = await axios.get(
              `https://pixabay.com/api/?key=48378802-72caf28c83fbe3c5978fec2e0&q=${encodeURIComponent(breed.name + ' dog')}&image_type=photo&per_page=3`
            );

            // Get a random image from the first 3 results, or use fallback
            const images = pixabayResponse.data.hits;
            const randomImage = images.length > 0 
              ? images[Math.floor(Math.random() * Math.min(images.length, 3))]?.largeImageURL
              : 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80';

            return {
              id: breed.id,
              name: breed.name,
              image: randomImage,
              category: breed.breed_group || 'Unknown',
              characteristics: {
                size: `${breed.height?.metric || 'Unknown'} cm`,
                weight: `${breed.weight?.metric || 'Unknown'} kg`,
                lifeSpan: breed.life_span || 'Unknown',
                temperament: breed.temperament || 'Unknown'
              }
            };
          } catch (error) {
            console.error('Pixabay API error:', error);
            // Return breed with fallback image if Pixabay fails
            return {
              id: breed.id,
              name: breed.name,
              image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80',
              category: breed.breed_group || 'Unknown',
              characteristics: {
                size: `${breed.height?.metric || 'Unknown'} cm`,
                weight: `${breed.weight?.metric || 'Unknown'} kg`,
                lifeSpan: breed.life_span || 'Unknown',
                temperament: breed.temperament || 'Unknown'
              }
            };
          }
        })
      );

      setResults(breeds);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to fetch results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search dog breeds..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="text-red-500 text-center mb-4 p-3 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {results.length > 0 ? (
          results.map((breed) => (
            <div 
              key={breed.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="md:flex">
                <div className="md:flex-shrink-0">
                  <img 
                    src={breed.image}
                    alt={breed.name}
                    className="h-48 w-full md:w-48 object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800">{breed.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Category: {breed.category}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                      Size: {breed.characteristics.size}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                      Weight: {breed.characteristics.weight}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                      Life Span: {breed.characteristics.lifeSpan}
                    </span>
                  </div>
                  {breed.characteristics.temperament && (
                    <p className="mt-3 text-sm text-gray-600">
                      <strong>Temperament:</strong> {breed.characteristics.temperament}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : query && !isLoading ? (
          <p className="text-center text-gray-600 py-8">
            No breeds found matching your search.
          </p>
        ) : null}
      </div>
    </div>
  );
}
