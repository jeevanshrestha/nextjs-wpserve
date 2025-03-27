'use client';
import { useState, useEffect } from "react";

interface ImageNode {
  id: string;
  title: string;
  slug: string;
  sourceUrl: string;
}

export default function Gallery() {
  const [images, setImages] = useState<{ node: ImageNode }[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        setIsLoading(true);
        const response = await fetch("https://wpserve.harveynormancommercial.com.au/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              {
                mediaItems(where: { search: "LeCavist" }) {
                  edges {
                    node {
                      id
                      title
                      slug
                      sourceUrl
                    }
                  }
                }
              }
            `,
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const { data } = await response.json();
        setImages(data?.mediaItems?.edges || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchImages();
  }, []);

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
    document.body.style.overflow = 'auto';
  };

  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex(prev => 
      prev !== null ? (prev + 1) % images.length : 0
    );
  };

  const goToPreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex(prev => 
      prev !== null ? (prev - 1 + images.length) % images.length : images.length - 1
    );
  };

  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') goToNextImage(e as any);
      if (e.key === 'ArrowLeft') goToPreviousImage(e as any);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, images.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">LeCavist 2025</h1>
          
        </div>

        {/* Masonry Grid */}
        {images.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No images found</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {images.map(({ node }, index) => (
              <div
                key={node.id}
                className="break-inside-avoid group relative cursor-pointer rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                onClick={() => openModal(index)}
              >
                <div className="relative pb-[100%]">
                  <img
                    src={node.sourceUrl}
                    alt={node.title || 'Gallery image'}
                    className="absolute w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {node.title && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-medium truncate">{node.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedImageIndex !== null && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-6xl w-full">
              <button
                onClick={closeModal}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center justify-center">
                <button
                  onClick={goToPreviousImage}
                  className="p-4 text-white hover:text-gray-300 transition-colors mr-2"
                  aria-label="Previous"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex-grow flex justify-center">
                  <img
                    src={images[selectedImageIndex].node.sourceUrl}
                    alt={images[selectedImageIndex].node.title || 'Gallery image'}
                    className="max-h-[80vh] max-w-full object-contain rounded-lg"
                  />
                </div>

                <button
                  onClick={goToNextImage}
                  className="p-4 text-white hover:text-gray-300 transition-colors ml-2"
                  aria-label="Next"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 text-center text-white">
                {images[selectedImageIndex].node.title && (
                  <p className="text-lg font-medium mb-2">
                    {images[selectedImageIndex].node.title}
                  </p>
                )}
                <p className="text-sm text-gray-300">
                  {selectedImageIndex + 1} of {images.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}