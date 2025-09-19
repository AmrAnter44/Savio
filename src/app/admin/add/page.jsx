"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [newprice, setNewprice] = useState("");

  const brandOptions = [
    "Chanel", "Dior", "Tom Ford", "Yves Saint Laurent", "Versace", "Gucci", 
    "Armani", "Calvin Klein", "Hugo Boss", "Dolce & Gabbana", "Paco Rabanne",
    "Jean Paul Gaultier", "Thierry Mugler", "Lancôme", "Hermès", "Creed",
    "Maison Margiela", "Viktor & Rolf", "Issey Miyake", "Burberry", "Other"
  ];
  
  const sizeOptions = ["50ml", "100ml", "150ml", "200ml", "250ml"];
  const typeOptions = ["men", "women"];

  const handleSizeChange = (size) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter(s => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const newPreviews = [];
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target.result);
        if (newPreviews.length === selectedFiles.length) {
          setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeImage = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    const uploadedUrls = [];
    
    for (let file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);
      
      if (error) {
        console.error('Upload error:', error);
        continue;
      }
      
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      if (urlData?.publicUrl) {
        uploadedUrls.push(urlData.publicUrl);
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !price || !brand || sizes.length === 0 || !type || files.length === 0) {
      setMessage("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    setMessage("Uploading images...");
    
    try {
      const pictureUrls = await uploadImages();
      
      if (pictureUrls.length === 0) {
        setMessage("Failed to upload images");
        setLoading(false);
        return;
      }
      
      setMessage("Creating product...");
      
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name,
          price: Number(price),
          newprice: newprice ? Number(newprice) : null,
          brand: brand,
          pictures: pictureUrls,
          sizes,
          type,
          owner_id: "admin"
        }]);
      
      if (error) {
        setMessage("Error: " + error.message);
      } else {
        setMessage("Fragrance added successfully!");
        // Reset form
        setName("");
        setPrice("");
        setNewprice("");
        setBrand("");
        setFiles([]);
        setPreviewUrls([]);
        setSizes([]);
        setType("");
      }
      
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Add New Fragrance</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Fragrance Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-900 focus:border-transparent"
            placeholder="Enter fragrance name"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-2">Price (LE) *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-900 focus:border-transparent"
            placeholder="Enter price"
            required
          />
        </div>

        {/* Sale Price */}
        <div>
          <label className="block text-sm font-medium mb-2">Sale Price (LE) - Optional</label>
          <input
            type="number"
            value={newprice}
            onChange={(e) => setNewprice(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-900 focus:border-transparent"
            placeholder="Enter sale price"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium mb-2">Brand *</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-900 focus:border-transparent"
            required
          >
            <option value="">Select Brand</option>
            {brandOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Category *</label>
          <div className="flex gap-3">
            {typeOptions.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                className={`px-4 py-2 rounded-md capitalize transition-colors ${
                  type === option 
                    ? 'bg-red-900 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-sm font-medium mb-2">Sizes *</label>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeChange(size)}
                className={`px-3 py-2 rounded-md text-sm transition-colors ${
                  sizes.includes(size)
                    ? 'bg-red-900 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-2">Images *</label>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-gray-500">
                <p className="text-lg">📁 Select Images</p>
                <p className="text-sm">Click to upload multiple images</p>
              </div>
            </label>
          </div>

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-md text-center ${
            message.includes('successfully') || message.includes('✅')
              ? 'bg-green-100 text-green-700'
              : message.includes('Error') || message.includes('❌')
              ? 'bg-red-100 text-red-700'
              : 'bg-red-900 text-red-900'
          }`}>
            {message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            loading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-red-900 hover:bg-red-900 text-white'
          }`}
        >
          {loading ? 'Adding...' : 'Add Fragrance'}
        </button>
      </form>
    </div>
  );
}