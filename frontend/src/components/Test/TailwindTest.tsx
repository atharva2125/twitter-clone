import React from 'react';

const TailwindTest: React.FC = () => {
  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4 my-4">
      <div className="flex-shrink-0">
        <div className="h-12 w-12 bg-twitter-blue rounded-full flex items-center justify-center text-white font-bold">T</div>
      </div>
      <div>
        <div className="text-xl font-medium text-black">Tailwind CSS is working!</div>
        <p className="text-gray-500">This component is styled with Tailwind CSS</p>
      </div>
    </div>
  );
};

export default TailwindTest;