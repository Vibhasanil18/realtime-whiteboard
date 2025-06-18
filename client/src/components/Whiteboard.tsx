import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import jsPDF from 'jspdf';
import '../styles/Whiteboard.css';

interface DrawLine {
  points: number[];
  stroke: string;
  strokeWidth: number;
}

interface RemoteCursor {
  id: string;
  x: number;
  y: number;
}

let socket: Socket;

const Whiteboard: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [lines, setLines] = useState<DrawLine[]>([]);
  const [history, setHistory] = useState<DrawLine[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawLine[][]>([]);
  const [color, setColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [cursors, setCursors] = useState<RemoteCursor[]>([]);

  const isDrawing = useRef(false);
  const stageRef = useRef<Konva.Stage | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    socket = io('http://localhost:5000');
    socket.emit('join', sessionId);

    socket.on('drawing', (remoteLine: DrawLine) => {
      setLines(prev => [...prev, remoteLine]);
    });

    socket.on('cursor', (cursor: RemoteCursor) => {
      setCursors(prev => {
        const updated = prev.filter(c => c.id !== cursor.id);
        return [...updated, cursor];
      });
    });

    socket.on('chat', (message: string) => {
      setChatMessages(prev => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    const newLine: DrawLine = {
      points: [pos.x, pos.y],
      stroke: color,
      strokeWidth,
    };

    setLines(prev => [...prev, newLine]);
    setHistory(prev => [...prev, lines]);
    setRedoStack([]);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    const lastLine = { ...lines[lines.length - 1] };
    lastLine.points = [...lastLine.points, point.x, point.y];
    setLines([...lines.slice(0, -1), lastLine]);

    socket?.emit('cursor', {
      id: socket.id,
      x: point.x,
      y: point.y,
      sessionId,
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    const latestLine = lines[lines.length - 1];
    socket?.emit('drawing', { sessionId, line: latestLine });
  };

  const handleUndo = () => {
    if (lines.length === 0) return;
    setRedoStack(prev => [...prev, lines]);
    setLines(history[history.length - 1] || []);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setLines(next);
    setHistory(prev => [...prev, lines]);
    setRedoStack(prev => prev.slice(0, -1));
  };

  const exportAsImage = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = `whiteboard-${sessionId}.png`;
    link.href = uri;
    link.click();
  };

  const exportAsPDF = () => {
    if (!stageRef.current) return;
    const canvas = stageRef.current.toCanvas();
    const dataUrl = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(dataUrl, 'PNG', 10, 10, 190, 120);
    pdf.save(`whiteboard-${sessionId}.pdf`);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    socket?.emit('chat', `[${socket?.id?.slice(0, 4)}]: ${chatInput}`);
    setChatInput('');
  };

  return (
    <div className="container-fluid whiteboard-wrapper">
      <div className="row h-100">
        {/* Toolbar */}
        <div className="col-md-2 toolbar p-3 border-end">
          <h5>🖌️ <strong>Tools</strong></h5>
          <hr />
          <label className="form-label">🎨 Color</label>
          <input type="color" className="form-control form-control-color mb-3" value={color} onChange={(e) => setColor(e.target.value)} />

          <label className="form-label">✏️ Stroke Width</label>
          <input type="range" className="form-range mb-3" min={1} max={20} value={strokeWidth} onChange={(e) => setStrokeWidth(parseInt(e.target.value))} />

          <div className="d-grid gap-2">
            <button className="btn btn-primary" onClick={handleUndo}>↩️ Undo</button>
            <button className="btn btn-secondary" onClick={handleRedo}>↪️ Redo</button>
            <button className="btn btn-success" onClick={exportAsImage}>🖼️ Export PNG</button>
            <button className="btn btn-danger" onClick={exportAsPDF}>📄 Export PDF</button>
          </div>
        </div>

        {/* Whiteboard Canvas */}
        <div className="col-md-8 canvas-area">
          <Stage
            ref={stageRef}
            width={window.innerWidth * 0.66}
            height={window.innerHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ background: '#ffffff', cursor: 'crosshair' }}
          >
            <Layer>
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.stroke}
                  strokeWidth={line.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  globalCompositeOperation="source-over"
                />
              ))}
              {cursors.map((cursor) => (
                <Line
                  key={cursor.id}
                  points={[cursor.x, cursor.y, cursor.x + 1, cursor.y + 1]}
                  stroke="red"
                  strokeWidth={4}
                />
              ))}
            </Layer>
          </Stage>
        </div>

        {/* Chat */}
        <div className="col-md-2 p-3 border-start chat-panel d-flex flex-column">
          <h6>💬 <strong>Live Chat</strong></h6>
          <div className="flex-grow-1 overflow-auto mb-2 chat-messages border rounded p-2 bg-light">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className="chat-message">{msg}</div>
            ))}
          </div>
          <div className="input-group">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message..."
              className="form-control"
            />
            <button className="btn btn-outline-primary" onClick={sendMessage}>📩</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
