"use client";

import Image from "next/image";
import { useState, useRef } from "react";

const apikey: any = process.env.NEXT_PUBLIC_IMAGE_ENHANCEMENT_API_KEY

export default function Home() {
  const [currentImage, setCurrentImage] = useState<any>(null);
  const [generatedImage, setGeneratedImage] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [description, setDescription] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCurrentImage(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const handleGenerateImage = async () => {
    if (description.length == 0) {
      return
    }
    if (!currentImage) {
      return
    }
    try {
      const formData = new FormData();
      formData.append('background.prompt', description)
      formData.append('outputSize', '1000x1000')
      formData.append('padding', '0.1')


      const base64Response = await fetch(currentImage);
      const blob = await base64Response.blob()
      formData.append('imageFile', blob)

      const response = await fetch('https://image-api.photoroom.com/v2/edit', {
        method: "POST",
        headers: {
          "x-api-key": apikey
        },
        body: formData
      })

      if (!response.ok) {
        const text = await response.text();
        console.error('api request failed', response.status, text)

        throw new Error(`api request failed with status: ${response.status}`);
      }

      const data = await response.blob();
      const url = window.URL.createObjectURL(data)
      setGeneratedImage(url)


    } catch (error) {
      console.log(error)
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-900 p-8">
      <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center space-y-6">
        <h1 className="text-3xl font-bold text-white">
          AI IMAGE <span className="text-teal-400">ENHANCER</span>
        </h1>
        <div className="w-full h-64 bg-gray-700 rounded-md flex justify-center items-center overflow-hidden">
          {currentImage && (
            <Image
              src={currentImage}
              alt="Selected"
              width={256}
              height={256}
              className="object-cover w-full h-full"
            />
          )}
          {generatedImage && (
            <Image
              src={generatedImage}
              alt="Selected"
              width={256}
              height={256}
              className="object-cover w-full h-full"
            />
          )}

          {generatedImage && (
            <a
              className="text-blue-800 hover:text-blue-600 font-semibold underline px-4 py-2 rounded-md shadow-md transition duration-200 ease-in-out transform hover:scale-105"
              download={true}
              href={generatedImage}
              target="_blank"
            >
              Download
            </a>
          )}

        </div>

        {/* Hidden file input */}
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />

        {/* Button to trigger file input */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 py-2 px-6 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          Choose File
        </button>

        {currentImage && (
          <div className="mt-4 flex flex-col items-center space-y-4">
            <input
              type="text"
              value={description}
              onChange={handleChange}
              className="w-full p-2 text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:border-teal-500"
              placeholder="Enter detail"
            />
            <button
              onClick={handleGenerateImage}
              className="mt-2 py-2 px-6 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Try
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
