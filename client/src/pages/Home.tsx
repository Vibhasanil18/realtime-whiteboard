import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import '../styles/Home.css';
import { FaPlus, FaSignInAlt, FaPenFancy, FaMoon, FaSun } from 'react-icons/fa';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [joinSessionId, setJoinSessionId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const wordingTemplates = [
    'Brainstorm ideas 💡',
    'Meeting Notes 📝',
    'To-do List ✅',
    'Pros & Cons ⚖️',
    'Design Draft 🎨',
  ];

  useEffect(() => {
    const storedTheme = localStorage.getItem('darkMode');
    if (storedTheme === 'true') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.body.classList.toggle('dark-mode');
  };

  const handleCreateSession = () => {
    const sessionId = uuidv4();
    navigate(`/whiteboard/${sessionId}`);
  };

  const handleJoinSession = () => {
    if (joinSessionId.trim()) {
      navigate(`/whiteboard/${joinSessionId.trim()}`);
    }
  };

  return (
    <div className="container py-5 home-container">
      {/* Dark Mode Toggle */}
      <div className="text-end mb-3">
        <button className="btn btn-outline-dark toggle-btn" onClick={toggleDarkMode}>
          {darkMode ? <FaSun /> : <FaMoon />} {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">🧠 Collaborative Whiteboard</h1>
        <p className="lead custom-muted-text">Plan, brainstorm, and collaborate with your team in real time.</p>
      </div>

      <div className="row justify-content-center g-4">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h5 className="mb-3 fw-semibold">Start New Session</h5>
            <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleCreateSession}>
              <FaPlus /> Create Session
            </button>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h5 className="mb-3 fw-semibold">Join Existing Session</h5>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter session ID"
                value={joinSessionId}
                onChange={(e) => setJoinSessionId(e.target.value)}
              />
              <button className="btn btn-success d-flex align-items-center gap-2" onClick={handleJoinSession}>
                <FaSignInAlt /> Join
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <FaPenFancy /> Explore Wording Templates
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Wording Templates</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                </div>
                <div className="modal-body">
                  <ul className="list-group">
                    {wordingTemplates.map((item, idx) => (
                      <li key={idx} className="list-group-item">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
