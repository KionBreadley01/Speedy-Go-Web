"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { foodService, uploadImage } from "@/lib/services/foodService";
import styles from "../login/auth.module.css";

export default function CreateFood() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    restaurantId: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setImageFile(file);

      const preview = URL.createObjectURL(file);

      setFormData((prev) => ({
        ...prev,
        image: preview,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      let imageUrl = "";

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      await foodService.createFood({
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        image: imageUrl,
        restaurantId: formData.restaurantId,
      });

      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al crear comida");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Agregar Comida</h1>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input id="name" placeholder="Nombre" required onChange={handleChange} />
          <input id="description" placeholder="Descripción" required onChange={handleChange} />
          <input id="price" type="number" placeholder="Precio" required onChange={handleChange} />

          <input type="file" accept="image/*" onChange={handleImageChange} required />

          {formData.image && <img src={formData.image} alt="preview" width={200} />}

          <input id="restaurantId" placeholder="Restaurant ID" required onChange={handleChange} />

          <button disabled={loading}>
            {loading ? "Guardando..." : "Crear comida"}
          </button>
        </form>
      </div>
    </div>
  );
}