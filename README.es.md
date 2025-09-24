# 🎬📚🎮 Plataforma de Biblioteca y Reseñas (Web)

Enlace directo a la página web: https://myvault-cf31b.web.app

Aplicación web desarrollada como **Trabajo de Fin de Grado (TFG)** en Desarrollo de Aplicaciones Multiplataforma (DAM).  
El proyecto consiste en una plataforma social donde los usuarios pueden **reseñar, puntuar, organizar y descubrir** contenido de entretenimiento en distintas categorías:

- 🎥 Películas  
- 📺 Series  
- 🎮 Videojuegos  
- 🍥 Anime  
- 📖 Manga  
- 📚 Novelas ligeras  

Además, la aplicación incluye funciones sociales y un sistema de **inteligencia artificial** que genera resúmenes automáticos de las reseñas de los usuarios.

---

## 🚀 Funcionalidades principales

- 🔎 **Búsqueda de contenidos** en APIs externas:
  - TMDb (películas y series)  
  - RAWG (videojuegos)  
  - AniList (anime, manga, novelas ligeras)  

- 📌 **Detalles de cada contenido**:  
  Información completa obtenida de las APIs y guardada en Firebase.

- 📝 **Reseñas de usuarios** con calificación.

- 🤖 **IA de resúmenes**:  
  Se genera automáticamente un resumen de las reseñas con la API de OpenAI cuando hay suficiente feedback (mín. 3 reseñas).  
  - Optimizado para consumir pocos tokens.  
  - Redacción en español con estilo de **crítico experto**.  

- 🌍 **Traducción automática al español**:  
  Las descripciones obtenidas de APIs externas en inglés se traducen mediante DeepL.

- 👥 **Funciones sociales**:  
  Añadir amigos, compartir gustos, chatear y crear y compartir listas personalizadas.

---

## 🛠️ Tecnologías utilizadas

- **Frontend**: Angular + TypeScript  
- **Backend**: Firebase (Realtime Database + Functions en Google Cloud)  
- **IA**: OpenAI API (resúmenes de reseñas)  
- **Traducción**: DeepL API  
- **APIs externas**: TMDb, RAWG, AniList  

---

## 📂 Estructura del proyecto

<code>/src
├── app
│ ├── services # Servicios Angular (APIs externas, Firebase, IA, traducción)
│ ├── components # Componentes UI (detalles, listas, reseñas, etc.)
│ ├── pages # Páginas principales (inicio, detalle, perfil, etc.)
│ ├── models # Interfaces y modelos de datos
│ └── guards # Verificación de autenticación
</code>

---

## 📸 Imágenes

### Página de inicio
<img width="1901" height="1310" alt="home" src="https://github.com/user-attachments/assets/a502fc24-53b1-4f6f-a096-0fa52ba0a948" />

### Contenido
<img width="1901" height="1675" alt="browse" src="https://github.com/user-attachments/assets/4541127b-6276-4590-9f7e-0a169987ace5" />

### Detalle de contenido
<img width="1901" height="2177" alt="detail" src="https://github.com/user-attachments/assets/2480f369-be6b-4c7b-9dcd-99928685a402" />

### Detalle de listas personalizadas
<img width="1901" height="1781" alt="customlist" src="https://github.com/user-attachments/assets/12b7cb6a-1351-495b-8e62-2e1e600e01ad" />

### Chats con amigos
<img width="1901" height="854" alt="chat" src="https://github.com/user-attachments/assets/c922db9f-41b3-433d-b701-958cdbe8ada3" />

---

## 👤 Autor

Desarrollado por **Antonio Jesús Barroso Mesa** como Trabajo de Fin de Grado (TFG) en **DAM**.  
📧 Contacto: [ajesusbarrosocontacto@gmail.com]  
💼 LinkedIn: [www.linkedin.com/in/ajesusbarroso]  

---

