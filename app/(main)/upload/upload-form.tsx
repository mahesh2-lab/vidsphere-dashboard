'use client'

import { useState, useRef, DragEvent } from 'react'
import { UploadCloud, FileVideo, X, CheckCircle2, Loader2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UploadForm() {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle')
  const [progress, setProgress] = useState(0)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState('private')

  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('video/')) {
        setSelectedFile(file)
        // Auto-fill title with filename (without extension)
        setTitle(file.name.replace(/\.[^/.]+$/, ""))
      } else {
        alert("Please upload a valid video file")
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setTitle(file.name.replace(/\.[^/.]+$/, ""))
    }
  }

  const performUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setUploadStatus('uploading')
      setProgress(0)

      // 1. Init resumable session
      const initRes = await fetch('/api/youtube/upload/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          visibility,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type || 'video/mp4'
        })
      });

      if (!initRes.ok) {
        const errorText = await initRes.text();
        throw new Error(errorText || 'Failed to initialize upload');
      }

      const { uploadUrl } = await initRes.json();

      // 2. Upload file via XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentCompleted = Math.round((event.loaded * 100) / event.total);
          setProgress(percentCompleted);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadStatus('success');
        } else {
          console.error("Upload failed with status:", xhr.status, xhr.responseText);
          alert('Upload failed: ' + xhr.responseText);
          setUploadStatus('idle');
        }
      });

      xhr.addEventListener('error', () => {
        alert('Network error during upload');
        setUploadStatus('idle');
      });

      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', selectedFile.type || 'video/mp4');
      xhr.send(selectedFile);

    } catch (error: any) {
      console.error(error);
      alert(error.message || 'An error occurred during upload');
      setUploadStatus('idle');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return
    performUpload()
  }

  const resetForm = () => {
    setSelectedFile(null)
    setUploadStatus('idle')
    setProgress(0)
    setTitle('')
    setDescription('')
    setVisibility('private')
  }

  if (uploadStatus === 'success') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Complete!</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Your video "{title}" has been successfully uploaded to your channel as {visibility}.
        </p>
        <Button onClick={resetForm} size="lg">Upload Another Video</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-100">
        {/* Upload Zone */}
        {!selectedFile ? (
          <div 
            className={`relative w-full h-64 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-200 ease-in-out ${
              dragActive 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              onChange={handleChange}
              className="hidden"
            />
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-1">
              Select video file to upload
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Or drag and drop video files here
            </p>
            <Button 
              type="button" 
              onClick={() => inputRef.current?.click()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Select File
            </Button>
          </div>
        ) : (
          <div className="relative w-full rounded-xl border border-gray-200 bg-gray-50 p-6 flex items-center gap-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-lg flex items-center justify-center shrink-0">
              <FileVideo className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-gray-900 truncate mb-1">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
              </p>
              
              {uploadStatus === 'uploading' && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-gray-700">Uploading...</span>
                    <span className="text-red-600">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-600 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {uploadStatus === 'idle' && (
              <button 
                type="button"
                onClick={() => setSelectedFile(null)}
                className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50/50">
        <div className="md:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Title (required)
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              placeholder="Add a title that describes your video"
              disabled={uploadStatus === 'uploading'}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
              placeholder="Tell viewers about your video"
              disabled={uploadStatus === 'uploading'}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all appearance-none bg-white"
              disabled={uploadStatus === 'uploading'}
            >
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-blue-800 text-sm">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              By submitting your videos to YouTube, you acknowledge that you agree to YouTube's Terms of Service and Community Guidelines.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
        <Button 
          type="button" 
          variant="outline" 
          onClick={resetForm}
          disabled={uploadStatus === 'uploading'}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={!selectedFile || uploadStatus === 'uploading' || !title.trim()}
          className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]"
        >
          {uploadStatus === 'uploading' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading
            </>
          ) : (
            'Upload Video'
          )}
        </Button>
      </div>
    </form>
  )
}
