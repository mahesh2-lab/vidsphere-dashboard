'use client'

import { useState, useRef, DragEvent } from 'react'
import { UploadCloud, FileVideo, X, CheckCircle2, Loader2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UploadForm() {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle')
  const [progress, setProgress] = useState(0)

  const [bucket, setBucket] = useState('')
  const [customMetadata, setCustomMetadata] = useState<{key: string, value: string}[]>([])

  const addMetadataField = () => {
    setCustomMetadata([...customMetadata, { key: '', value: '' }])
  }

  const updateMetadataField = (index: number, field: 'key' | 'value', val: string) => {
    const newMetadata = [...customMetadata]
    newMetadata[index][field] = val
    setCustomMetadata(newMetadata)
  }

  const removeMetadataField = (index: number) => {
    const newMetadata = [...customMetadata]
    newMetadata.splice(index, 1)
    setCustomMetadata(newMetadata)
  }

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
    }
  }

  const abortControllerRef = useRef<AbortController | null>(null)

  const performUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadStatus('uploading')
      setProgress(0)

      abortControllerRef.current = new AbortController()

      // 1. Init resumable session
      const initRes = await fetch('/api/youtube/upload/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: selectedFile.name,
          bucket,
          privacyStatus: 'unlisted',
          customMetadata,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type || 'video/mp4'
        }),
        signal: abortControllerRef.current.signal
      });

      if (!initRes.ok) {
        const errorText = await initRes.text();
        throw new Error(errorText || 'Failed to initialize upload');
      }

      const { uploadUrl, uploadId } = await initRes.json();

      // 2. Upload file via axios for progress tracking
      const axios = (await import('axios')).default;
      
      await axios.put(uploadUrl, selectedFile, {
        headers: {
          'Content-Type': selectedFile.type || 'video/mp4'
        },
        signal: abortControllerRef.current.signal,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        }
      });

      // 3. Mark complete
      try {
        await fetch('/api/youtube/upload/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uploadId }),
          signal: abortControllerRef.current.signal
        });
      } catch (e) {
        console.error('Failed to update completion status', e);
      }

      setUploadStatus('success');

    } catch (error: any) {
      if (error?.name === 'AbortError' || error?.message?.includes('canceled')) {
        console.log('Upload cancelled');
      } else {
        console.error(error);
        alert(error.message || 'An error occurred during upload');
      }
      setUploadStatus('idle');
      setProgress(0);
    } finally {
      abortControllerRef.current = null
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    } else {
      resetForm()
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
    setBucket('')
    setCustomMetadata([])
  }

  if (uploadStatus === 'success') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Complete!</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Your video has been successfully uploaded to the <strong>{bucket || 'default'}</strong> bucket.
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
            className={`relative w-full h-64 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-200 ease-in-out ${dragActive
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

      <div className="p-8 bg-gray-50/50 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Bucket (optional)
          </label>
          <input
            type="text"
            value={bucket}
            onChange={(e) => setBucket(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all"
            placeholder="e.g. marketing, backups"
            disabled={uploadStatus === 'uploading'}
          />
          <p className="text-xs text-gray-500 mt-2">
            Used to organize your uploaded videos. Defaults to 'default' if left blank.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-gray-900">
              Custom Metadata
            </label>
            <button
              type="button"
              onClick={addMetadataField}
              disabled={uploadStatus === 'uploading'}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              + Add Field
            </button>
          </div>
          
          <div className="space-y-3">
            {customMetadata.length === 0 && (
              <p className="text-sm text-gray-500 italic">No custom metadata added.</p>
            )}
            {customMetadata.map((meta, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={meta.key}
                  onChange={(e) => updateMetadataField(index, 'key', e.target.value)}
                  placeholder="Key (e.g. Campaign)"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all"
                  disabled={uploadStatus === 'uploading'}
                />
                <input
                  type="text"
                  value={meta.value}
                  onChange={(e) => updateMetadataField(index, 'value', e.target.value)}
                  placeholder="Value (e.g. Summer2024)"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all"
                  disabled={uploadStatus === 'uploading'}
                />
                <button
                  type="button"
                  onClick={() => removeMetadataField(index)}
                  disabled={uploadStatus === 'uploading'}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!selectedFile || uploadStatus === 'uploading'}
          className="bg-zinc-900 hover:bg-zinc-800 text-white min-w-[120px]"
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
