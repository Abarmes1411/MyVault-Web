# 🎬📚🎮 Library & Review Platform (Web)

Direct link to the website: https://myvault-cf31b.web.app

Web application developed as the **Final Degree Project (TFG)** for the Multiplatform Application Development (DAM) program.  
The project is a social platform where users can **review, rate, organize, and discover** entertainment content across different categories:

- 🎥 Movies  
- 📺 TV Shows  
- 🎮 Video Games  
- 🍥 Anime  
- 📖 Manga  
- 📚 Light Novels  

In addition, the application includes social features and an **artificial intelligence system** that generates automatic summaries of user reviews.

---

## 🚀 Main Features

- 🔎 **Content search** using external APIs:
  - TMDb (movies & TV shows)  
  - RAWG (video games)  
  - AniList (anime, manga, light novels)  

- 📌 **Content details**:  
  Complete information retrieved from APIs and stored in Firebase.

- 📝 **User reviews** with ratings.

- 🤖 **AI-generated summaries**:  
  Automatic summaries of user reviews are generated with the OpenAI API when there is enough feedback (min. 3 reviews).  
  - Optimized to consume fewer tokens.  
  - Written in Spanish in the style of an **expert critic**.  

- 🌍 **Automatic translation into Spanish**:  
  Descriptions retrieved from external APIs in English are translated via DeepL.

- 👥 **Social features**:  
  Add friends, share preferences, chat, and create/share custom lists.

---

## 🛠️ Technologies Used

- **Frontend**: Angular + TypeScript  
- **Backend**: Firebase (Realtime Database + Functions in Google Cloud)  
- **AI**: OpenAI API (review summaries)  
- **Translation**: DeepL API  
- **External APIs**: TMDb, RAWG, AniList  

---

## 📂 Project Structure

<code>/src
├── app
│ ├── services     # Angular services (external APIs, Firebase, AI, translation)
│ ├── components   # UI components (details, lists, reviews, etc.)
│ ├── pages        # Main pages (home, detail, profile, etc.)
│ ├── models       # Interfaces and data models
│ └── guards       # Authentication checks
</code>

---

## 📸 Screenshots

### Home Page
<img width="1901" height="1310" alt="home" src="https://github.com/user-attachments/assets/a502fc24-53b1-4f6f-a096-0fa52ba0a948" />

### Content
<img width="1901" height="1675" alt="browse" src="https://github.com/user-attachments/assets/4541127b-6276-4590-9f7e-0a169987ace5" />

### Content Details
<img width="1901" height="2177" alt="detail" src="https://github.com/user-attachments/assets/2480f369-be6b-4c7b-9dcd-99928685a402" />

### Custom Lists Details
<img width="1901" height="1781" alt="customlist" src="https://github.com/user-attachments/assets/12b7cb6a-1351-495b-8e62-2e1e600e01ad" />

### Friend Chats
<img width="1901" height="854" alt="chat" src="https://github.com/user-attachments/assets/c922db9f-41b3-433d-b701-958cdbe8ada3" />

---

## 👤 Author

Developed by **Antonio Jesús Barroso Mesa** as the Final Degree Project (TFG) in **Multiplatform Application Development (DAM)**.  
📧 Contact: [ajesusbarrosocontacto@gmail.com]  
💼 LinkedIn: [www.linkedin.com/in/ajesusbarroso]  

---
