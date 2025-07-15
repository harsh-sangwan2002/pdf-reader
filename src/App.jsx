import PdfUploader from './PdfUploader';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-700 mb-8">PDF Reader</h1>
      <PdfUploader />
    </div>
  )
}

export default App;
