import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image, Camera, ScanLine, AlertCircle } from 'lucide-react';
import { scanApi } from '../api/scanApi';
import { useScanStore } from '../store/scanStore';
import ScanProgress from '../components/scan/ScanProgress';
import toast from 'react-hot-toast';

type StepKey = 'idle' | 'uploading' | 'analyzing' | 'detecting' | 'diagnosing' | 'complete' | 'error';

const STEPS: StepKey[] = ['uploading', 'analyzing', 'detecting', 'diagnosing', 'complete'];
const STEP_DURATIONS = [800, 2000, 1500, 2000, 600];

export default function ScanUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [petName, setPetName] = useState('');
  const [currentStep, setCurrentStep] = useState<StepKey>('idle');
  const [scanning, setScanning] = useState(false);

  const { setUploadedImageUrl, setScanResult, reset } = useScanStore();
  const navigate = useNavigate();

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setCurrentStep('idle');
  };

  const runSteps = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      setCurrentStep(STEPS[i]);
      await new Promise((r) => setTimeout(r, STEP_DURATIONS[i]));
    }
  };

  const handleScan = async () => {
    if (!file) {
      toast.error('Please select an image first');
      return;
    }
    if (!petName.trim()) {
      toast.error('Please enter your pet\'s name');
      return;
    }

    reset();
    setScanning(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('pet_name', petName.trim());

    try {
      // Start animated steps in parallel with the API call
      const [result] = await Promise.all([
        scanApi.uploadScan(formData),
        runSteps(),
      ]);

      if (!result.is_valid_pet) {
        toast.error('Image does not appear to contain a valid pet. Please try another image.');
        setCurrentStep('error');
        setScanning(false);
        return;
      }

      setUploadedImageUrl(preview!);
      setScanResult(result);
      setCurrentStep('complete');

      await new Promise((r) => setTimeout(r, 600));
      toast.success('Analysis complete!');
      navigate(`/results/${result.scan_id}`);
    } catch (err) {
      setCurrentStep('error');
      setScanning(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">AI Disease Scan</h1>
        <p className="text-slate-400 text-sm mt-1">Upload a clear photo of your pet for AI health analysis</p>
      </div>

      <AnimatePresence mode="wait">
        {!scanning ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Pet Name Input */}
            <div className="bg-dark-800 border border-white/5 rounded-2xl p-5">
              <label className="text-sm font-medium text-white mb-3 block">Pet Name / Type</label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="e.g., Buddy (Golden Retriever)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
              <p className="text-xs text-slate-500 mt-2">This helps the AI identify your pet type</p>
            </div>

            {/* Image Upload */}
            {!preview ? (
              <div
                {...getRootProps()}
                className={`bg-dark-800 border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-500/5'
                    : 'border-white/10 hover:border-primary-500/50 hover:bg-white/3'
                }`}
              >
                <input {...getInputProps()} />
                <motion.div
                  animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${isDragActive ? 'bg-primary-500/20' : 'bg-white/5'}`}>
                    <Upload className={`w-10 h-10 ${isDragActive ? 'text-primary-400' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {isDragActive ? 'Drop your pet image here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">Supports JPG, PNG, WEBP — Max 10MB</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1"><Image className="w-3 h-3" /> Upload file</span>
                    <span>or</span>
                    <span className="flex items-center gap-1"><Camera className="w-3 h-3" /> Camera</span>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="relative bg-dark-800 border border-white/5 rounded-2xl overflow-hidden">
                <img src={preview} alt="Preview" className="w-full object-contain max-h-96" />
                <button
                  onClick={clearFile}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/70 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-green-400 text-xs px-3 py-1.5 rounded-full border border-green-500/30">
                  ✓ Image ready
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-4 space-y-2">
              <p className="text-blue-400 text-xs font-semibold">📸 Photo Tips for Best Results</p>
              {[
                'Ensure good lighting on the affected area',
                'Get close to any visible wounds, rashes or lesions',
                'Avoid blurry or dark images',
              ].map((t) => (
                <p key={t} className="text-slate-400 text-xs flex items-start gap-2">
                  <span className="text-primary-400">•</span> {t}
                </p>
              ))}
            </div>

            {/* Scan button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleScan}
              disabled={!file || !petName.trim()}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed glow-teal"
            >
              <ScanLine className="w-5 h-5" />
              Start AI Analysis
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <ScanProgress currentStep={currentStep} />

            {currentStep === 'error' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-400 text-sm font-medium">Analysis failed</p>
                  <p className="text-slate-400 text-xs mt-1">Please try again or check your backend connection.</p>
                </div>
                <button
                  onClick={() => { setScanning(false); setCurrentStep('idle'); }}
                  className="ml-auto text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Retry
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
