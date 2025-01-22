import React from 'react';
import { BookOpen, Play } from 'lucide-react';
import { mockResources } from '../data/mockData';

export function Resources() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Mental Health Resources</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {mockResources.map((resource) => (
          <div key={resource.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={resource.thumbnail}
              alt={resource.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center mb-2">
                {resource.type === 'article' ? (
                  <BookOpen className="h-5 w-5 text-rose-500 mr-2" />
                ) : (
                  <Play className="h-5 w-5 text-rose-500 mr-2" />
                )}
                <span className="text-sm text-gray-500 capitalize">{resource.type}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
              <p className="text-gray-600 mb-4">{resource.description}</p>
              <button className="w-full bg-rose-500 text-white rounded-md py-2 px-4 hover:bg-rose-600">
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}