import "./App.css";
import React, { useState, useEffect } from 'react';

type Note = {
  id: number;
  title: string;
  content: string;
  owner: string;
}

const loadCredentials = () => {
  const storedCredentials = localStorage.getItem('credentials');
  if (storedCredentials) {
    return JSON.parse(storedCredentials);
  }
  const username = prompt('Enter your username: ');
  const password = prompt('Enter your password: ');
  localStorage.setItem('credentials', JSON.stringify({ username, password }));
  return { username, password };
};

const App = () => {
  const [credentials, setCredentials] = useState(loadCredentials());

  const [notes, setNotes] = useState<Note[]>([]);
  const [page, setPage] = useState<number>(0);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const authHeaders = { 'Authorization': 'Basic ' + btoa(credentials.username + ":" + credentials.password) };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`http://localhost:8080/notes?page=${page}&size=10&sort=id,desc`, { headers: { ...authHeaders } } );

        const notes: Note[] = await response.json();

        setNotes(notes);
      } catch (error) {
        console.log('Error fetching notes: ', error);
      }
    };

    fetchNotes();
  }, [credentials, page]);

  const nextPage = () => {
    //if (notes.length > 0) {
      setPage(page + 1);
    //}
  }

  const prevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  }

  const handleAddNote = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:8080/notes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders
          },
          body: JSON.stringify({
            title,
            content
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 400) {
          alert("Title or content is too long. Please shorten it.");
        } else {
          alert("Unknown error occurred when creating note!")
        }

        throw new Error("Expected HTTP response code 200 OK, but received " + response.status);
      }

      const newNoteLocation = await response.headers.get('Location');

      if (newNoteLocation === null) {
        throw new Error("Expected a 'Location' header to be included in POST response, but got null");
      }

      const newNote: Note = {
        "id": parseInt(newNoteLocation.split('/').pop() || "", 10),
        "title": title,
        "content": content,
        "owner": credentials.username
      };

      setNotes([newNote, ...notes]);
      setTitle("");
      setContent("");
    } catch (error) {
      console.log('Error creating a note: ', error);
    }
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  }

  const handleUpdateNote = async (
    event: React.FormEvent
    ) => {
    event.preventDefault();

    if (!selectedNote) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/notes/${selectedNote.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders
          },
          body: JSON.stringify({
            title,
            content
          }),
        }
      );

      if (!(response.status === 204)) {
        if (response.status === 400) {
          alert("Title or content is too long. Please shorten it.");
        } else {
          alert("Unknown error occurred when creating note!")
        }

        throw new Error("Expected HTTP response code 204 No Content, but received " + response.status);
      }

      const updatedNote: Note = {
        id: selectedNote.id,
        title: title,
        content: content,
        owner: credentials.username
      };

      const updatedNotesList = notes.map ((note) => (note.id === selectedNote.id ? updatedNote : note));

      setNotes(updatedNotesList);
      setTitle("");
      setContent("");
      setSelectedNote(null);
    } catch (error) {
      console.log('Error creating a note: ', error);
    }
  }

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setSelectedNote(null);
  };

  const deleteNote = async (
      event: React.MouseEvent,
      noteId: number
    ) => {
    event.stopPropagation();

    try {
      await fetch(
        `http://localhost:8080/notes/${noteId}`,
        {
          method: "DELETE",
          headers: {
            ...authHeaders
          }
        }
      );

      const updatedNotes = notes.filter((note) => note.id !== noteId);
      setNotes(updatedNotes);
    } catch (error) {
      console.log('Error deleting a note: ', error);
    }
  };

  return (
    <div className="app-container">
      <form
        className="note-form"
        onSubmit={(event) => (selectedNote ? handleUpdateNote(event) : handleAddNote(event))}
      >
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

        {selectedNote ? (
          <div className="edit-buttons">
            <button type="submit">Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        ) : (
          <button type="submit">Add Note</button>
        )}
      <div className="page-buttons">
        <button onClick={prevPage}>Previous page</button>
        <button onClick={nextPage}>Next page</button>
      </div>
      </form>
      <div className="notes-grid">
        {notes.map((note) => (
          <div key={note.id} className="note-item" onClick={() => handleNoteClick(note)}>
            <div className="notes-header">
              <button onClick={(event) => deleteNote(event, note.id)}>x</button>
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
