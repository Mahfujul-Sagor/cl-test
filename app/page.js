"use client";
import { CldUploadWidget } from "next-cloudinary";
import { useState, useEffect, useCallback } from "react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { Cloudinary } from "@cloudinary/url-gen";
import { generativeRestore, upscale, enhance } from "@cloudinary/url-gen/actions/effect";
import { improve } from "@cloudinary/url-gen/actions/adjust";

export default function Home() {
  const [resource, setResource] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);

  // Function to generate enhanced image
  const generateEnhancedImage = useCallback((imageUrl) => {
    const cld = new Cloudinary({
      cloud: {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      }
    });

    // Get the public_id from the uploaded URL (remove the URL prefix for transformations)
    const publicId = imageUrl.split('/').pop().split('.')[0];

    // Apply transformation and generate the enhanced image URL
    const transformedImage = cld.image(publicId);        // Create Cloudinary image instance using public_id
    transformedImage
      .effect(generativeRestore())
      .effect(upscale())
      .effect(enhance())

    return transformedImage.toURL();                     // Generate and return the enhanced image URL
  }, []);  // Empty dependency array ensures the function remains stable across renders

  // Load the uploaded image URL from local storage when the component mounts
  useEffect(() => {
    const storedImage = localStorage.getItem("uploadedImage");

    if (storedImage) {
      setResource(storedImage);
      const enhancedUrl = generateEnhancedImage(storedImage);  // Generate enhanced image using the stored image URL
      setEnhancedImage(enhancedUrl);
    }
  }, [generateEnhancedImage]);  // Include `generateEnhancedImage` in dependency array

  const handleImageUpload = (result) => {
    const uploadedUrl = result?.info?.secure_url;
    setResource(uploadedUrl);
    localStorage.setItem("uploadedImage", uploadedUrl); // Save the image URL to local storage

    // Generate enhanced image immediately after upload
    const enhancedUrl = generateEnhancedImage(uploadedUrl);   // Use the function to enhance the uploaded image
    setEnhancedImage(enhancedUrl);
  };

  return (
    <main className="min-h-screen w-full flex flex-col justify-start items-center gap-20 pt-20">
      <h1 className="text-6xl font-bold">Image Upload & Compare</h1>

      {/* Only show the upload button if no image has been uploaded yet */}
      {!resource && (
        <CldUploadWidget
          uploadPreset="betatest"
          onSuccess={(result) => handleImageUpload(result)}
          onQueuesEnd={({ widget }) => widget.close()}
        >
          {({ open }) => (
            <button
              onClick={() => open()}
              className="border bg-white text-black font-medium px-4 py-2 rounded-lg"
            >
              Upload an Image
            </button>
          )}
        </CldUploadWidget>
      )}

      {/* Display the uploaded image and the comparison slider */}
      {resource && enhancedImage && (
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-3xl font-medium">Compare Images</h2>
          <div className="w-[600px] h-[600px] rounded-lg overflow-hidden">
            <ReactCompareSlider
              itemOne={
                <ReactCompareSliderImage
                  src={resource} // Original uploaded image
                  alt="Original Image"
                  style={{ objectFit: "cover" }}
                />
              }
              itemTwo={
                <ReactCompareSliderImage
                  src={enhancedImage} // Enhanced image
                  alt="Enhanced Image"
                  style={{ objectFit: "cover" }}
                />
              }
              style={{ width: '100%', height: '100%' }} // Makes the slider take the full width and height of the wrapper
            />
          </div>

          {/* Option to remove the image and upload again */}
          <button
            onClick={() => {
              setResource(null);
              setEnhancedImage(null);
              localStorage.removeItem("uploadedImage"); // Clear image from local storage
            }}
            className="border bg-red-500 text-white font-medium px-4 py-2 rounded-lg mt-4"
          >
            Remove Image
          </button>
        </div>
      )}
    </main>
  );
}
