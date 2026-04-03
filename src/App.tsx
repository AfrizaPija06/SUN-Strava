import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Upload, Plus, Trash2, RefreshCw, Trophy, AlertCircle, CheckCircle2, Settings, List, LayoutList, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Athlete, StravaRecord } from './types';
import { INITIAL_ATHLETES, calculateTotal } from './data/mockData';
import { extractStravaData } from './lib/gemini';

const getWeekInfo = (weekKey: string) => {
  const weekNum = parseInt(weekKey.replace(/[^0-9]/g, ''));
  if (isNaN(weekNum)) return { month: '', week: weekKey };

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  // Asumsi 1 bulan = 4 pekan untuk penyederhanaan tampilan
  const monthIndex = Math.floor((weekNum - 1) / 4) % 12;
  const weekInMonth = ((weekNum - 1) % 4) + 1;

  return {
    month: months[monthIndex],
    week: `Pekan ${weekInMonth}`
  };
};

export default function App() {
  const [athletes, setAthletes] = useState<Athlete[]>(() => {
    try {
      const saved = localStorage.getItem('strava_athletes');
      return saved ? JSON.parse(saved) : INITIAL_ATHLETES;
    } catch (e) {
      return INITIAL_ATHLETES;
    }
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState<string>(() => {
    return localStorage.getItem('strava_current_week') || 'P7';
  });
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeView, setActiveView] = useState<'summary' | 'full'>('summary');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('strava_athletes', JSON.stringify(athletes));
  }, [athletes]);

  useEffect(() => {
    localStorage.setItem('strava_current_week', currentWeek);
  }, [currentWeek]);

  // Get all unique weeks across all athletes
  const allWeeks = useMemo(() => {
    const weeks = new Set<string>();
    athletes.forEach(a => {
      Object.keys(a.weeklyData).forEach(w => weeks.add(w));
    });
    return Array.from(weeks).sort((a, b) => {
      // Sort P1, P2, P10 correctly
      const numA = parseInt(a.replace('P', ''));
      const numB = parseInt(b.replace('P', ''));
      return numA - numB;
    });
  }, [athletes]);

  // Sort athletes by total distance descending
  const sortedAthletes = useMemo(() => {
    return [...athletes].sort((a, b) => b.total - a.total);
  }, [athletes]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64String = (reader.result as string).split(',')[1];
          const mimeType = file.type;

          // Call Gemini AI
          const extractedData = await extractStravaData(base64String, mimeType);
          
          if (extractedData.length === 0) {
            throw new Error("AI could not find any leaderboard data in the image.");
          }

          processExtractedData(extractedData);
          setSuccessMsg(`Successfully processed ${extractedData.length} records for week ${currentWeek}!`);
          
          // Auto-increment week for next time
          const nextWeekNum = parseInt(currentWeek.replace('P', '')) + 1;
          setCurrentWeek(`P${nextWeekNum}`);

        } catch (err: any) {
          setError(err.message || "Failed to process image.");
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setIsUploading(false);
      };
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setIsUploading(false);
    }
  };

  const processExtractedData = (records: StravaRecord[]) => {
    setAthletes(prevAthletes => {
      const updatedAthletes = [...prevAthletes];

      records.forEach(record => {
        // Find existing athlete by checking aliases
        let athleteIndex = updatedAthletes.findIndex(a => 
          a.stravaNames.some(name => name.toLowerCase() === record.stravaName.toLowerCase())
        );

        if (athleteIndex >= 0) {
          // Update existing
          const athlete = { ...updatedAthletes[athleteIndex] };
          athlete.weeklyData = { ...athlete.weeklyData, [currentWeek]: record.distance };
          athlete.total = calculateTotal(athlete.weeklyData);
          updatedAthletes[athleteIndex] = athlete;
        } else {
          // Create new athlete
          const newAthlete: Athlete = {
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            name: record.stravaName, // Default name to strava name
            stravaNames: [record.stravaName],
            weeklyData: { [currentWeek]: record.distance },
            total: record.distance
          };
          updatedAthletes.push(newAthlete);
        }
      });

      return updatedAthletes;
    });
  };

  const handleClearData = () => {
    setAthletes([]);
    setShowClearConfirm(false);
    setSuccessMsg("Semua data berhasil dikosongkan. Silakan mulai dari P1.");
    setCurrentWeek('P1');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-emerald-200">
      {/* Header */}
      <header className="bg-emerald-600 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-yellow-300" />
            <h1 className="text-2xl font-bold tracking-tight">SUN SPORT Leaderboard</h1>
          </div>
          <button 
            onClick={() => setShowAdmin(!showAdmin)}
            className="p-2 rounded-full hover:bg-emerald-700 transition-colors"
            title="Admin Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Admin / Upload Section */}
        <AnimatePresence>
          {showAdmin && (
            <motion.section 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-emerald-600" />
                    Upload Weekly Strava Screenshot
                  </h2>
                  
                  {/* Clear Data Button */}
                  <div className="relative">
                    {!showClearConfirm ? (
                      <button 
                        onClick={() => setShowClearConfirm(true)}
                        className="text-sm flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Kosongkan Data
                      </button>
                    ) : (
                      <div className="flex items-center bg-red-50 text-red-700 px-3 py-1.5 rounded-md text-sm border border-red-100">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        <span className="mr-3 font-medium">Yakin hapus semua?</span>
                        <button onClick={handleClearData} className="font-bold hover:underline mr-3">Ya</button>
                        <button onClick={() => setShowClearConfirm(false)} className="hover:underline">Batal</button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Week</label>
                    <input 
                      type="text" 
                      value={currentWeek}
                      onChange={(e) => setCurrentWeek(e.target.value)}
                      className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      placeholder="e.g. P7"
                    />
                    {currentWeek && (
                      <div className="text-xs text-emerald-600 mt-1.5 font-medium">
                        Tampil: {getWeekInfo(currentWeek).month} {getWeekInfo(currentWeek).week}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Screenshot Image</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-emerald-50 file:text-emerald-700
                        hover:file:bg-emerald-100
                        disabled:opacity-50 cursor-pointer"
                    />
                  </div>
                </div>

                {isUploading && (
                  <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    AI is analyzing the screenshot...
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start text-sm">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                {successMsg && (
                  <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg flex items-start text-sm">
                    <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    {successMsg}
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* View Toggles & Leaderboard */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          
          {/* Tabs */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-center sm:justify-start">
            <div className="flex space-x-1 bg-gray-200/60 p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setActiveView('summary')}
                className={`flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeView === 'summary' 
                    ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                <List className="w-4 h-4 mr-2" />
                Leaderboard Hasil
              </button>
              <button
                onClick={() => setActiveView('full')}
                className={`flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeView === 'full' 
                    ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                <LayoutList className="w-4 h-4 mr-2" />
                Data Lengkap
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-4 text-center w-16">Rank</th>
                  <th className="py-4 px-4 min-w-[150px]">Nama</th>
                  {activeView === 'full' && allWeeks.map(week => {
                    const info = getWeekInfo(week);
                    return (
                      <th key={week} className="py-3 px-3 text-right min-w-[80px]">
                        {info.month && <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{info.month}</div>}
                        <div className="text-sm">{info.week}</div>
                      </th>
                    );
                  })}
                  <th className="py-4 px-4 text-right font-bold text-gray-900 min-w-[100px]">Total (km)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence mode="popLayout">
                  {sortedAthletes.length === 0 ? (
                    <tr>
                      <td colSpan={activeView === 'full' ? allWeeks.length + 3 : 3} className="py-12 text-center text-gray-500">
                        Belum ada data. Silakan upload screenshot Strava di menu Admin.
                      </td>
                    </tr>
                  ) : (
                    sortedAthletes.map((athlete, index) => (
                      <motion.tr 
                        key={athlete.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-emerald-50/30 transition-colors group"
                      >
                        <td className="py-3 px-4 text-center font-medium">
                          {index === 0 ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400/20">1</span> :
                           index === 1 ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 ring-2 ring-gray-400/20">2</span> :
                           index === 2 ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-700 ring-2 ring-orange-400/20">3</span> :
                           <span className="text-gray-400 w-7 h-7 inline-flex items-center justify-center">{index + 1}</span>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900">{athlete.name}</div>
                          {showAdmin && (
                            <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-1">
                              {athlete.stravaNames.map((alias, i) => (
                                <span key={i} className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{alias}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        {activeView === 'full' && allWeeks.map(week => (
                          <td key={week} className="py-3 px-3 text-right text-gray-500 font-mono text-sm">
                            {athlete.weeklyData[week] !== undefined ? athlete.weeklyData[week].toFixed(1) : '-'}
                          </td>
                        ))}
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                            {athlete.total.toFixed(1)}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}

