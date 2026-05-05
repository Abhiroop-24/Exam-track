# Exam Tracker

A minimal and structured exam preparation tracker built with React and Tailwind CSS.
The application helps students monitor topic completion, revisions, practice progress, and confidence levels across subjects.

---

## Live Demo

https://examtracker-pearl.vercel.app/

---
## Preview

<img width="1905" height="966" alt="image" src="https://github.com/user-attachments/assets/c94ff857-e5fb-4dd2-ae52-d6265343c286" />

---

## Features

* Subject → Unit → Topic hierarchy
* Track completion, revision (Rev 1 and Rev 2), and practice
* Confidence levels: Low, Medium, High
* Progress tracking per subject
* Filter for incomplete topics
* Automatic identification of weak areas
* Persistent state using browser localStorage
* Clean, responsive dark interface

---

## Purpose

This project is intended to provide a structured approach to exam preparation by:

* Improving visibility of study progress
* Encouraging systematic revision
* Highlighting weak areas for focused improvement

---

## Tech Stack

* React (Vite)
* Tailwind CSS
* localStorage for persistence

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/Abhiroop-24/Exam-track.git
cd Exam-track
```

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

---

## Project Structure

```
src/
 ├── components/
 │    ├── Sidebar.jsx
 │    ├── SubjectCard.jsx
 │    ├── UnitCard.jsx
 │    ├── TopicRow.jsx
 │    └── ProgressBar.jsx
 │
 ├── data/
 │    └── syllabus.js
 │
 ├── App.jsx
 └── main.jsx
```

---

## Roadmap

* Add optional cloud synchronization
* Add daily planning view
* Export progress data
* Improve mobile responsiveness

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Open a pull request

---

## License

This project is licensed under the MIT License.

---

## Author

Abhiroop
https://github.com/Abhiroop-24
