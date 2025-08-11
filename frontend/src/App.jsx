// Lokasi file: frontend/src/App.jsx
import { useState } from 'react';

// --- Ikon SVG untuk tombol Copy ---
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zM-1 7a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
  </svg>
);


// --- Style Objects for Dark Theme ---
const styles = {
  container: {
    maxWidth: '700px',
    margin: '40px auto',
    padding: '20px 40px',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#E5E7EB',
  },
  formContainer: {
    background: '#1F2937',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid #374151',
    display: 'grid',
    gap: '15px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '5px',
    fontSize: '0.9rem',
    color: '#D1D5DB',
  },
  input: {
    padding: '10px',
    backgroundColor: '#374151',
    border: '1px solid #4B5563',
    borderRadius: '8px',
    color: '#F9FAFB',
    fontSize: '1rem',
  },
  button: {
    padding: '12px',
    cursor: 'pointer',
    backgroundColor: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  },
  buttonLoading: {
    backgroundColor: '#4C1D95',
    cursor: 'not-allowed',
  },
  resultsContainer: {
    marginTop: '30px',
    background: '#1F2937',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid #374151',
  },
  promptContainer: {
    position: 'relative',
  },
  promptBox: {
    background: '#111827',
    padding: '15px',
    paddingRight: '45px',
    borderRadius: '8px',
    whiteSpace: 'pre-wrap',
    color: '#D1D5DB',
    fontFamily: 'monospace',
    border: '1px solid #374151',
  },
  hashtag: {
    background: '#374151',
    color: '#93C5FD',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.9rem',
  },
  h3: {
    color: '#A5B4FC',
    borderBottom: '1px solid #374151',
    paddingBottom: '5px',
    marginBottom: '15px',
  },
  ul: {
    listStyleType: 'none',
    paddingLeft: '0',
  },
  li: {
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  },
  copyButton: {
    background: '#374151',
    border: '1px solid #4B5563',
    color: '#D1D5DB',
    cursor: 'pointer',
    padding: '6px 8px',
    borderRadius: '6px',
    marginLeft: '10px',
    display: 'flex',
    alignItems: 'center',
  },
  copyButtonPrompt: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '6px 8px',
    background: '#374151',
    border: '1px solid #4B5563',
    color: '#D1D5DB',
    cursor: 'pointer',
    borderRadius: '6px',
  },
  notification: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#10B981',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    zIndex: '1000',
    fontSize: '0.9rem',
  },
  // --- STYLE BARU UNTUK PREVIEW THUMBNAIL ---
  trendingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
  },
  trendingCard: {
    background: '#374151',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  trendingThumbnail: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  trendingTitle: {
    padding: '10px',
    fontSize: '0.8rem',
    color: '#D1D5DB',
    height: '60px', // Batasi tinggi agar rapi
    overflow: 'hidden',
  }
};
// --- End of Styles ---

function App() {
  const [niche, setNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [locationAudience, setLocationAudience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [copyNotification, setCopyNotification] = useState('');

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyNotification(`${type} berhasil disalin!`);
      setTimeout(() => setCopyNotification(''), 2000);
    }, (err) => {
      console.error('Gagal menyalin: ', err);
    });
  };

  const handleAnalyzeClick = async () => {
    setIsLoading(true);
    setResults(null);
    const dataToSend = { niche, targetAudience, locationAudience };

    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mendapatkan respon dari server');
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Terjadi error:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {copyNotification && <div style={styles.notification}>{copyNotification}</div>}
      <header style={styles.header}>
        <h1 style={styles.title}>YT Trend-Bot 🤖</h1>
      </header>
      
      <div style={styles.formContainer}>
        {/* Form tidak berubah */}
        <div style={styles.inputGroup}>
          <label htmlFor="niche-input" style={styles.label}>Tema / Niche Konten</label>
          <input id="niche-input" type="text" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="cth: review gadget" style={styles.input} />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="target-audience-input" style={styles.label}>Target Audiens</label>
          <input id="target-audience-input" type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="cth: pelajar" style={styles.input} />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="location-audience-input" style={styles.label}>Lokasi Audiens</label>
          <input id="location-audience-input" type="text" value={locationAudience} onChange={(e) => setLocationAudience(e.target.value)} placeholder="cth: Indonesia" style={styles.input} />
        </div>
        <button onClick={handleAnalyzeClick} disabled={isLoading} style={{...styles.button, ...(isLoading && styles.buttonLoading)}}>
          {isLoading ? 'Menganalisa...' : 'Analisa Tren'}
        </button>
      </div>

      {results && (
        <div style={styles.resultsContainer}>
          {/* --- BAGIAN BARU: PREVIEW THUMBNAIL --- */}
          {results.trendingVideos && results.trendingVideos.length > 0 && (
            <>
              <h3 style={styles.h3}>Contoh Konten Trending</h3>
              <div style={styles.trendingGrid}>
                {results.trendingVideos.map((video, index) => (
                  <div key={index} style={styles.trendingCard}>
                    <img src={video.thumbnailUrl} alt={video.title} style={styles.trendingThumbnail} />
                    <p style={styles.trendingTitle}>{video.title}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <h3 style={{...styles.h3, marginTop: '30px'}}>Rekomendasi Judul</h3>
          <ul style={styles.ul}>
            {results.titles.map((title, index) => (
              <li key={index} style={styles.li}>
                <span>• {title}</span>
                <button style={styles.copyButton} onClick={() => handleCopy(title, 'Judul')}>
                  <CopyIcon />
                </button>
              </li>
            ))}
          </ul>
          
          <h3 style={{...styles.h3, marginTop: '20px'}}>Prompt Thumbnail</h3>
          <div style={styles.promptContainer}>
            <p style={styles.promptBox}>{results.thumbnail_prompt}</p>
            <button style={styles.copyButtonPrompt} onClick={() => handleCopy(results.thumbnail_prompt, 'Prompt')}>
                <CopyIcon />
            </button>
          </div>
          
          <h3 style={{...styles.h3, marginTop: '20px'}}>Rekomendasi Hashtag</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {results.hashtags.map((tag, index) => (
              <span key={index} style={styles.hashtag}>#{tag}</span>
            ))}
          </div>
          <button 
            onClick={() => handleCopy(results.hashtags.map(t => `#${t}`).join(' '), 'Hashtag')} 
            style={{...styles.button, marginTop: '15px', width: '100%', backgroundColor: '#374151'}}>
            Copy Semua Hashtag
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
