"use client";

import Image from "next/image";
import { useState, useRef } from "react";

const apikey: string | undefined = process.env.NEXT_PUBLIC_IMAGE_ENHANCEMENT_API_KEY;

export default function Home() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [description, setDescription] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setCurrentImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const handleGenerateImage = async () => {
    if (!description || !currentImage) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("background.prompt", description);
      formData.append("outputSize", "1000x1000");
      formData.append("padding", "0.1");

      const base64Response = await fetch(currentImage);
      const blob = await base64Response.blob();
      formData.append("imageFile", blob);

      const response = await fetch("https://image-api.photoroom.com/v2/edit", {
        method: "POST",
        headers: {
          "x-api-key": apikey || "",
        },
        body: formData,
      });

      if (!response.ok) {
        console.error("API request failed", response.status, await response.text());
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.blob();
      const url = URL.createObjectURL(data);
      setGeneratedImage(url);
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 p-8 flex flex-col items-center">
      {/* Fixed Header */}
      <header className="top-0 w-full py-4 text-center bg-gray-800 shadow-md">
        <h1 className="text-3xl font-bold text-white">
          AI IMAGE <span className="text-teal-400">ENHANCER</span>
        </h1>
      </header>

      {/* Content Container */}
      <div className="w-full max-w-3xl p-6 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center space-y-6 mt-6">
        {/* Image Selection & Enhancement */}
        <div className="flex w-full justify-between gap-6">
          {/* Selected Image Box */}
          <div className="w-1/2 h-64 bg-gray-700 rounded-md flex justify-center items-center overflow-hidden">
            {currentImage ? (
              <Image
                src={currentImage}
                alt="Selected"
                width={256}
                height={256}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-gray-400">Select an image</span>
            )}
          </div>

          {/* Enhanced Image Box */}
          <div className="w-1/2 h-64 bg-gray-700 rounded-md flex justify-center items-center overflow-hidden">
            {loading ? (
              <div className="loader border-t-4 border-white border-solid rounded-full w-12 h-12 animate-spin"></div>
            ) : generatedImage ? (
              <Image
                src={generatedImage}
                alt="Enhanced"
                width={256}
                height={256}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-gray-400">Enhanced image appears here</span>
            )}
          </div>
        </div>

        {/* File Input */}
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 py-2 px-6 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          Choose File
        </button>

        {/* Enhance Button */}
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
              disabled={loading}
              className={`mt-2 py-2 px-6 font-semibold rounded-md focus:outline-none focus:ring-2 ${
                loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {loading ? "Enhancing..." : "Try"}
            </button>
          </div>
        )}

        {/* Download Button */}
        {generatedImage && !loading && (
          <a
            className="text-blue-400 hover:text-blue-300 font-semibold underline px-4 py-2 rounded-md shadow-md transition duration-200 ease-in-out transform hover:scale-105"
            download
            href={generatedImage}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download Enhanced Image
          </a>
        )}
      </div>

      {/* Loader Styles */}
      <style jsx>{`
        .loader {
          border-top: 4px solid white;
          border-right: 4px solid transparent;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
