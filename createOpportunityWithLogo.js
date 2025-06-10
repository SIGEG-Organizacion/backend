import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Obtener la ruta del directorio actual en ESM
const __dirname = path.resolve(path.dirname(''));

const createOpportunityWithLogo = async () => {
  // Crear FormData para enviar la solicitud
  const form = new FormData();

  // Agregar campos de texto
  form.append('description', 'Join our innovative team as a Data Scientist');
  form.append('requirements[]', "Master's degree in Data Science");
  form.append('requirements[]', '5+ years of experience in machine learning');
  form.append('benefits[]', 'Fully remote work');
  form.append('mode', 'remote');
  form.append('deadline', '2025-12-31');
  form.append('email', 'datascience-careers@techinnovate.com');
  form.append('forStudents', 'true');

  // Usar path.resolve() para obtener la ruta completa y asegurarse de que esté bien formateada
  const logoPath = path.resolve(__dirname, 'testLogo.png'); // Ajusta la ruta si es necesario
  const logoStream = fs.createReadStream(logoPath);

  // Asegurémonos de que el archivo exista
  if (!fs.existsSync(logoPath)) {
    console.error('Error: El archivo de logo no se encuentra en la ruta especificada.');
    return;
  }

  form.append('logo', logoStream, 'testLogo.png'); // Agregar archivo al FormData

  try {
    // Realizar la solicitud POST al backend
    const response = await axios.post('http://localhost:5000/api/opportunities/create', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer YOUR_JWT_TOKEN`, // Sustituye con un JWT válido si es necesario
      },
    });

    console.log('Respuesta del servidor:', response.data);
  } catch (error) {
    // Si hay un error, muestra detalles completos del error
    console.error('Error al crear la oportunidad:', error);

    if (error.response) {
      console.error('Detalles del error en respuesta:', error.response.data);
    } else {
      console.error('Error de red o configuración:', error.message);
    }
  }
};

// Ejecutar el script
createOpportunityWithLogo();
