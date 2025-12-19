const upload_preset = import.meta.env.VITE_UPLOAD_PRESET;
const cloud_name = import.meta.env.VITE_CLOUD_NAME;

const uploadImageToCloudinary = async (file) => {
        if (!upload_preset || !cloud_name) {
                throw new Error('Cloudinary no está configurado. Define VITE_CLOUD_NAME y VITE_UPLOAD_PRESET en Frontend/.env.');
        }

        const uploadData = new FormData();

        uploadData.append('file', file);
        uploadData.append('upload_preset', upload_preset);
        uploadData.append('cloud_name', cloud_name);

        const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
                {
                        method: 'POST',
                        body: uploadData,
                }
        );

        const data = await res.json();

        if (!res.ok) {
                const reason = data?.error?.message || data?.message || 'Error desconocido al subir la imagen.';
                throw new Error(`Cloudinary: ${reason}`);
        }

        return data;
};

export default uploadImageToCloudinary