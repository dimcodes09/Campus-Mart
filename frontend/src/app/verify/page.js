"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitStudentVerification } from "@/services/api";

export default function VerifyPage() {
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!image) return alert("Please select your student ID image");

    setLoading(true);
    try {
      const { data } = await submitStudentVerification(image);
      if (data.success) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify(data.user || { ...user, isVerified: false, verificationStatus: "pending" })
        );
        window.dispatchEvent(new Event("auth-change"));
        setDone(true);
        setTimeout(() => router.push("/"), 1500);
      } else {
        alert(data.message || "Verification failed");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-2xl">Verification request submitted!</p>
        <p className="text-gray-500 mt-2">An admin will review your student ID.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
      <h1 className="text-2xl font-bold">Student Verification</h1>
      <p className="text-gray-500">Upload your college ID card for admin review</p>

      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="border p-2 rounded w-full max-w-sm"
      />

      {image && (
        <img src={image} alt="preview" className="w-48 h-32 object-cover rounded border" />
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit for Review"}
      </button>
    </div>
  );
}
