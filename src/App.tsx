import "./App.css";
import React, { useState } from 'react';

type Note = {
  id: number;
  title: string;
  content: string;
}

const App = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      title: "test note 1",
      content: "note 1 content"
    },
    {
      id: 2,
      title: "test note 2",
      content: "note 2 content"
    },
    {
      id: 3,
      title: "test note 3",
      content: "note 3 content"
    },
    {
      id: 4,
      title: "test note 4",
      content: "note 4 content"
    },
    {
      id: 5,
      title: "test note 5",
      content: "note 5 content"
    },
    {
      id: 6,
      title: "test note 6",
      content: "note 6 content"
    },
    {
      id: 7,
      title: "test note 7",
      content: "note 7 content"
    }
  ]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();
    console.log("title: ", title);
    console.log("content: ", content);

    const newNote: Note = {
      id: notes.length + 1,
      title: title,
      content: content
    }

    setNotes([newNote, ...notes]);
    setTitle("");
    setContent("");
  };

  return (
    <div className="app-container">
      <form className="note-form" onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          required
        ></input>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Content"
          rows={10}
          required
        ></textarea>

        <button type="submit">Add Note</button>
      </form>
      <div className="notes-grid">
        {notes.map((note) => (
          <div className="note-item">
            <div className="notes-header">
              <button>x</button>
            </div>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
