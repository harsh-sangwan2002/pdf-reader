import React, { useRef, useState, useEffect } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

function PdfUploader() {
    const [fileName, setFileName] = useState('');
    const [fileUrl, setFileUrl] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isPageTurning, setIsPageTurning] = useState(false);
    const [turnDirection, setTurnDirection] = useState('');
    const fileInputRef = useRef(null);
    const viewerRef = useRef(null);

    const pageNavigationPluginInstance = pageNavigationPlugin();
    const { jumpToPage, CurrentPageInput } = pageNavigationPluginInstance;

    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: (defaultTabs) => defaultTabs,
        toolbarPlugin: {
            toolbarPlugin: {
                renderDefaultToolbar: (Toolbar) => (
                    <Toolbar>
                        {(slots) => {
                            const {
                                CurrentPageInput,
                                Download,
                                EnterFullScreen,
                                NumberOfPages,
                                Print,
                                Search,
                                Zoom,
                                ZoomIn,
                                ZoomOut,
                            } = slots;
                            return (
                                <div className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 border-b">
                                    <div className="flex items-center space-x-2">
                                        <Search />
                                        <div className="w-px h-6 bg-gray-300"></div>
                                        <ZoomOut />
                                        <Zoom />
                                        <ZoomIn />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CurrentPageInput />
                                        <span className="text-sm text-gray-600">/</span>
                                        <NumberOfPages />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Print />
                                        <Download />
                                        <EnterFullScreen />
                                    </div>
                                </div>
                            );
                        }}
                    </Toolbar>
                ),
            },
        },
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setFileName(file.name);
            setFileUrl(URL.createObjectURL(file));
        } else {
            setFileName('');
            setFileUrl(null);
            alert('Please select a valid PDF file.');
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleDocumentLoad = (e) => {
        setTotalPages(e.doc.numPages);
    };

    const handlePageChange = (e) => {
        setCurrentPage(e.currentPage);
    };

    const goToPreviousPage = () => {
        if (currentPage > 0 && !isPageTurning) {
            setIsPageTurning(true);
            setTurnDirection('prev');
            setTimeout(() => {
                jumpToPage(currentPage - 1);
                setTimeout(() => {
                    setIsPageTurning(false);
                    setTurnDirection('');
                }, 300);
            }, 200);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages - 1 && !isPageTurning) {
            setIsPageTurning(true);
            setTurnDirection('next');
            setTimeout(() => {
                jumpToPage(currentPage + 1);
                setTimeout(() => {
                    setIsPageTurning(false);
                    setTurnDirection('');
                }, 300);
            }, 200);
        }
    };

    // Handle mouse wheel scrolling for page navigation
    useEffect(() => {
        const handleWheel = (e) => {
            if (viewerRef.current && viewerRef.current.contains(e.target)) {
                e.preventDefault();
                const delta = e.deltaY;

                if (delta > 0) {
                    // Scroll down - go to next page
                    goToNextPage();
                } else {
                    // Scroll up - go to previous page
                    goToPreviousPage();
                }
            }
        };

        document.addEventListener('wheel', handleWheel, { passive: false });
        return () => document.removeEventListener('wheel', handleWheel);
    }, [currentPage, totalPages, isPageTurning]);

    return (
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-7xl w-full mx-auto text-center">
            <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
            <button
                onClick={handleButtonClick}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-lg transition-colors duration-200"
            >
                Upload PDF
            </button>
            {fileName && (
                <div className="mt-4 text-gray-700">
                    Selected file: <span className="font-medium">{fileName}</span>
                </div>
            )}
            {fileUrl && (
                <div className="mt-6 relative">
                    {/* Book-like container with page turning buttons */}
                    <div className="relative bg-amber-50 rounded-lg shadow-2xl overflow-hidden border-4 border-amber-200">
                        {/* Page turning buttons */}
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 0}
                            className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-30 p-3 rounded-r-lg transition-all duration-300 ${currentPage === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl'
                                }`}
                            style={{ marginLeft: '10px' }}
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <button
                            onClick={goToNextPage}
                            disabled={currentPage >= totalPages - 1}
                            className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-30 p-3 rounded-l-lg transition-all duration-300 ${currentPage >= totalPages - 1
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl'
                                }`}
                            style={{ marginRight: '10px' }}
                        >
                            <ChevronRight size={24} />
                        </button>

                        {/* PDF Viewer with custom styling */}
                        <div className="pdf-book-viewer">
                            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                <Viewer
                                    fileUrl={fileUrl}
                                    plugins={[defaultLayoutPluginInstance, pageNavigationPluginInstance]}
                                    onDocumentLoad={handleDocumentLoad}
                                    onPageChange={handlePageChange}
                                    defaultScale={1.0}
                                />
                            </Worker>
                        </div>
                    </div>

                    {/* Page indicator */}
                    <div className="mt-4 flex justify-center items-center space-x-4">
                        <div className="bg-amber-100 px-4 py-2 rounded-full border border-amber-300">
                            <span className="text-amber-800 font-medium">
                                Page {currentPage + 1} of {totalPages}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .pdf-book-viewer {
                    height: 800px;
                    overflow: hidden;
                    position: relative;
                    perspective: 1000px;
                }
                
                .page-container {
                    height: 100%;
                    width: 100%;
                    transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    transform-style: preserve-3d;
                }
                
                .page-container.turning-next {
                    animation: turnPageNext 0.6s ease-in-out;
                }
                
                .page-container.turning-prev {
                    animation: turnPagePrev 0.6s ease-in-out;
                }
                
                @keyframes turnPageNext {
                    0% { transform: rotateY(0deg); }
                    50% { transform: rotateY(-90deg) translateZ(50px); }
                    100% { transform: rotateY(0deg); }
                }
                
                @keyframes turnPagePrev {
                    0% { transform: rotateY(0deg); }
                    50% { transform: rotateY(90deg) translateZ(50px); }
                    100% { transform: rotateY(0deg); }
                }
                
                .pdf-book-viewer .rpv-core__viewer {
                    height: 100% !important;
                    overflow: auto !important;
                }
                
                .pdf-book-viewer .rpv-core__inner-pages {
                    overflow: auto !important;
                    height: 100% !important;
                }
                
                .pdf-book-viewer .rpv-core__page-container {
                    transition: opacity 0.3s ease-in-out;
                }
                
                /* Custom scrollbar styling */
                .pdf-book-viewer .rpv-core__viewer::-webkit-scrollbar,
                .pdf-book-viewer .rpv-core__inner-pages::-webkit-scrollbar {
                    width: 8px;
                }
                
                .pdf-book-viewer .rpv-core__viewer::-webkit-scrollbar-track,
                .pdf-book-viewer .rpv-core__inner-pages::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 4px;
                }
                
                .pdf-book-viewer .rpv-core__viewer::-webkit-scrollbar-thumb,
                .pdf-book-viewer .rpv-core__inner-pages::-webkit-scrollbar-thumb {
                    background: rgba(180, 83, 9, 0.6);
                    border-radius: 4px;
                }
                
                .pdf-book-viewer .rpv-core__viewer::-webkit-scrollbar-thumb:hover,
                .pdf-book-viewer .rpv-core__inner-pages::-webkit-scrollbar-thumb:hover {
                    background: rgba(180, 83, 9, 0.8);
                }
                
                /* Firefox scrollbar styling */
                .pdf-book-viewer .rpv-core__viewer,
                .pdf-book-viewer .rpv-core__inner-pages {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(180, 83, 9, 0.6) rgba(0, 0, 0, 0.1);
                }
                
                /* Style the toolbar */
                .pdf-book-viewer .rpv-toolbar {
                    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                    border-bottom: 2px solid #d1d5db;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                
                /* Style page transitions */
                .pdf-book-viewer .rpv-core__page {
                    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    border-radius: 8px;
                    overflow: hidden;
                    backface-visibility: hidden;
                    margin-bottom: 20px;
                }
                
                /* Book-like shadow and styling */
                .pdf-book-viewer .rpv-core__viewer-container {
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                
                /* Enhance the book appearance */
                .pdf-book-viewer::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(0, 0, 0, 0.05) 2%,
                        transparent 4%,
                        transparent 96%,
                        rgba(0, 0, 0, 0.05) 98%,
                        transparent 100%
                    );
                    pointer-events: none;
                    z-index: 1;
                }
                
                /* Add book spine effect */
                .pdf-book-viewer::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 100%;
                    background: linear-gradient(
                        180deg,
                        rgba(0, 0, 0, 0.1) 0%,
                        rgba(0, 0, 0, 0.05) 50%,
                        rgba(0, 0, 0, 0.1) 100%
                    );
                    pointer-events: none;
                    z-index: 2;
                }
                
                /* Add page curl effect during turning */
                .turning-next .rpv-core__page,
                .turning-prev .rpv-core__page {
                    box-shadow: 
                        0 8px 24px rgba(0, 0, 0, 0.3),
                        0 0 0 1px rgba(255, 255, 255, 0.1);
                }
                
                /* Smooth cursor change for interactive areas */
                .pdf-book-viewer .rpv-core__page {
                    cursor: grab;
                }
                
                .pdf-book-viewer .rpv-core__page:active {
                    cursor: grabbing;
                }
                
                /* Add subtle page texture */
                .pdf-book-viewer .rpv-core__page-layer {
                    position: relative;
                }
                
                .pdf-book-viewer .rpv-core__page-layer::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: 
                        radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
                    pointer-events: none;
                    z-index: 1;
                }
                
                /* Ensure content scrollability */
                .pdf-book-viewer .rpv-core__page-layer {
                    overflow: visible;
                }
                
                /* Responsive design for better viewing */
                @media (max-width: 768px) {
                    .pdf-book-viewer {
                        height: 600px;
                    }
                }
            `}</style>
        </div>
    );
}

export default PdfUploader;