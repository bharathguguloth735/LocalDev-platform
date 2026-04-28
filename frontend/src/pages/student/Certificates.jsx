import { useState, useEffect, useRef } from 'react';
import { Award, Download, Calendar, Loader2, Shield, CheckCircle } from 'lucide-react';
import { api } from '../../api.js';

// ── Inline Certificate Renderer ────────────────────────────────────────────
const CertificateCard = ({ name, projectTitle, clientName, date, certNumber, studentDetail = {}, isPreview = false }) => {
  const formattedDate = date ? new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).replace(/\//g, '-') : new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).replace(/\//g, '-');

  return (
    <div
      className="relative w-full h-full bg-[#fdf8f0] overflow-hidden select-none"
      style={{
        border: '8px solid #c9a227',
        boxShadow: '0 0 0 3px #e8c96a, inset 0 0 30px rgba(201,162,39,0.08)',
        borderRadius: '6px',
        fontFamily: 'Georgia, serif',
      }}
    >
      {/* ── Gold corner ornaments ── */}
      {['top-0 left-0', 'top-0 right-0 rotate-90', 'bottom-0 right-0 rotate-180', 'bottom-0 left-0 -rotate-90'].map((pos, i) => (
        <svg key={i} className={`absolute w-16 h-16 opacity-60 ${pos}`} viewBox="0 0 60 60" fill="none">
          <path d="M0 0 L60 0 L0 60 Z" fill="#c9a227" opacity="0.15" />
          <path d="M4 4 L4 24 Q4 4 24 4 Z" stroke="#c9a227" strokeWidth="1" fill="none" />
          <circle cx="8" cy="8" r="3" fill="#c9a227" />
          <path d="M12 4 L4 12" stroke="#c9a227" strokeWidth="0.5" />
          <path d="M20 4 L4 20" stroke="#c9a227" strokeWidth="0.5" />
        </svg>
      ))}

      {/* ── Background rose / pattern ── */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-64 h-64">
          <path d="M100 10 C120 40 160 40 180 70 C200 100 180 140 160 160 C140 180 100 190 80 170 C60 150 20 150 10 120 C0 90 20 50 40 30 C60 10 80 -20 100 10Z" fill="#c9a227" />
        </svg>
      </div>

      <div className="relative z-10 h-full flex flex-col px-10 py-6">

        {/* ── Top Row: ISO + Title + Logo + Approved ── */}
        {/* ── Header: Triple Column Protocol ── */}
        <div className="flex items-start justify-between mb-8">
          {/* ISO Section */}
          <div className="w-28 flex flex-col items-start">
            <div className="w-16 h-16 rounded-full border-4 border-yellow-600 bg-white flex flex-col items-center justify-center shadow-sm">
              <div className="text-green-800 font-black text-[7px] uppercase leading-none">ISO</div>
              <div className="w-8 h-[1px] bg-green-700 my-0.5" />
              <div className="text-green-800 font-black text-[6px] uppercase leading-none">Certified</div>
            </div>
            <div className="mt-1 text-[7px] font-black text-green-800 uppercase tracking-widest">ISO 9001:2015</div>
          </div>

          {/* Main Title Section */}
          <div className="flex-1 text-center">
            <h1 className="text-5xl font-black text-blue-900 tracking-[0.2em] leading-none mb-1" style={{ fontFamily: 'Georgia, serif' }}>
              CERTIFICATE
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-yellow-600" />
              <span className="text-[10px] uppercase tracking-[0.4em] text-yellow-700 font-black">Of Achievement</span>
              <div className="h-px w-10 bg-yellow-600" />
            </div>
            <div className="text-yellow-600 text-2xl mt-1">❧</div>
          </div>

          {/* Logo Section */}
          <div className="w-32 flex flex-col items-end gap-2 text-right">
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-90" />
                <svg className="relative z-10 w-10 h-10" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="6" fill="white" opacity="0.3" />
                  <path d="M10 16 Q16 8 22 16" stroke="white" strokeWidth="2" fill="none" />
                  <circle cx="16" cy="20" r="3" fill="white" />
                </svg>
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs font-black text-blue-900">LocalDev</div>
                <div className="text-[7px] font-bold text-slate-500 tracking-[0.1em]">CONNECT</div>
              </div>
            </div>
            <div className="bg-green-700 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm">✓ Verified</div>
          </div>
        </div>

        {/* ── Main Content Body ── */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">This official credential is awarded to</p>
            <h2 className="text-5xl font-black text-blue-950 tracking-wide mt-2" style={{ fontFamily: 'Georgia, serif' }}>
              {name || 'Distinguished Student'}
            </h2>
            <div className="w-96 h-[2px] bg-gradient-to-r from-transparent via-yellow-600/60 to-transparent mx-auto" />
          </div>

          <div className="space-y-3 md:space-y-4 max-w-2xl px-6">
            <p className="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              For demonstrating exceptional proficiency and dedication in the successful completion of
            </p>
            <div className="border-y-2 border-slate-100 py-3 md:py-4 bg-white/30 backdrop-blur-sm px-6 md:px-10 shadow-sm rounded-lg">
               <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase line-clamp-2">
                 {projectTitle || 'Professional Development Project'}
               </h3>
            </div>
            <p className="text-[9px] md:text-[10px] text-slate-400 italic max-w-lg mx-auto leading-tight">
              This industrial project was commissioned by <span className="font-black text-slate-700 underline decoration-yellow-600/30 underline-offset-4">{clientName || 'Local Business Partner'}</span> and verified through the 
              LocalDev Connect certification nodes for professional excellence and performance.
            </p>
          </div>
        </div>

        {/* ── Bottom Row: Signature + Wreath + Date + ISO footer ── */}
        <div className="mt-auto pt-4 relative">
          {/* Real-time Verification QR */}
          <div className="absolute left-0 bottom-16 flex flex-col items-center gap-1">
            <div className="p-1.5 bg-white border-2 border-slate-100 rounded-xl shadow-lg">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                  `CERTIFICATE VERIFIED\nID: ${certNumber}\nSTUDENT: ${name}\nPROJECT: ${projectTitle}\nDATE: ${formattedDate}`
                )}`} 
                alt="Verification QR" 
                className="w-16 h-16"
              />
            </div>
            <span className="text-[7px] font-black uppercase text-slate-400 tracking-[0.2em] mt-1">Scan to Verify</span>
          </div>

          {/* Signature & Date row */}
          <div className="flex items-end justify-between pl-20 pr-4">
            {/* Student Meta Column */}
            <div className="flex flex-col gap-0.5 items-start text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest text-left">
               <div>Record ID: {certNumber}</div>
               <div>Institution: {studentDetail?.university || 'LocalDev Academy'}</div>
               <div>Specialization: Full Stack Development</div>
            </div>

            {/* Signature */}
            <div className="text-center pb-1">
              <div className="text-lg md:text-xl font-black italic text-slate-700 mb-0.5"
                style={{ fontFamily: 'Brush Script MT, cursive', transform: 'rotate(-2deg)' }}>
                {name || 'Signature'}
              </div>
              <div className="w-28 md:w-32 h-[1px] bg-slate-400" />
              <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-slate-500 mt-1 font-bold">Signature</p>
            </div>

            {/* Gold Laurel Wreath */}
            <div className="flex flex-col items-center pb-2">
              <svg viewBox="0 0 80 60" className="w-12 h-10 md:w-16 md:h-12" fill="none">
                <g transform="translate(40,40)">
                  {/* Left branch */}
                  {[-40,-32,-24,-16,-8].map((x, i) => (
                    <g key={`l${i}`} transform={`rotate(${-60 + i * 12})`}>
                      <path d={`M0,0 C${-5},-6 ${-8},-12 ${-4},-18`} stroke="#d4a017" strokeWidth="1" fill="none"/>
                      <ellipse cx={-4} cy={-18} rx="4" ry="6" fill="#d4a017" transform={`rotate(${-20+i*8},-4,-18)`} opacity="0.9"/>
                    </g>
                  ))}
                  {/* Right branch */}
                  {[40,32,24,16,8].map((x, i) => (
                    <g key={`r${i}`} transform={`rotate(${60 - i * 12})`}>
                      <path d={`M0,0 C${5},-6 ${8},-12 ${4},-18`} stroke="#d4a017" strokeWidth="1" fill="none"/>
                      <ellipse cx={4} cy={-18} rx="4" ry="6" fill="#d4a017" transform={`rotate(${20-i*8},4,-18)`} opacity="0.9"/>
                    </g>
                  ))}
                  <circle cx="0" cy="-2" r="3" fill="#d4a017" />
                </g>
              </svg>
            </div>

            {/* Date */}
            <div className="text-center pb-1">
              <div className="text-xs md:text-sm font-black text-blue-900 mb-0.5">{formattedDate}</div>
              <div className="w-28 md:w-32 h-[1px] bg-slate-400" />
              <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-slate-500 mt-1 font-bold">Date</p>
            </div>
          </div>

          {/* ISO Footer bar */}
          <div className="mt-3 flex items-center justify-center gap-3 bg-slate-50 border border-yellow-200 rounded px-4 py-1.5">
            <div className="bg-blue-900 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider">ISO</div>
            <p className="text-[9px] font-bold text-slate-700 tracking-wide uppercase">
              ISO Certified &amp; Government of TS Approved
            </p>
            <div className="bg-green-700 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
              <CheckCircle className="w-2 h-2" /> Approved
            </div>
            <div className="ml-2 text-[9px] text-slate-500 font-mono font-bold">No. {certNumber || '8770155'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const studentName = user?.name || 'Student';

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const data = await api.getCertificates();
        if (!Array.isArray(data)) return;
        
        // Deduplicate by certificateNumber or project ID
        const uniqueCerts = data.reduce((acc, current) => {
          if (!current || !current.certificateNumber) return acc;
          const x = acc.find(item => item.certificateNumber === current.certificateNumber);
          if (!x) return acc.concat([current]);
          return acc;
        }, []);
        setCertificates(uniqueCerts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const handlePrint = (certId) => {
    setDownloading(certId);
    setTimeout(() => {
      window.print();
      setDownloading(null);
    }, 100);
  };

  if (loading) {
    return <div className="p-8 flex justify-center mt-20 text-slate-400"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  // Always show the sample certificate first, then real earned ones
  const sampleCert = {
    _id: 'sample',
    studentName: studentName,
    projectTitle: 'Sample Project',
    clientName: 'LocalDev Connect',
    issueDate: new Date().toISOString(),
    certificateNumber: `LDC-${Math.floor(10000000 + Math.random() * 90000000)}`,
    isPreview: true,
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <style>{`
        @media print {
          @page {
            size: A4 landscape !important;
            margin: 0 !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            width: 100% !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: hidden !important;
          }

          /* Hide ALL content in the viewport initially */
          body {
            visibility: hidden !important;
          }

          /* Force isolation for the selected certificate only */
          .selected-for-print {
            visibility: visible !important;
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            z-index: 99999999 !important;
            margin: 0 !important;
            background: white !important;
          }

          /* Ensure all nested elements like text and images are visible */
          .selected-for-print * {
            visibility: visible !important;
          }

          /* Specifically kill the sidebar/nav/buttons so they don't even exist in the print DOM */
          .no-print, header, nav, sidebar, button {
            display: none !important;
          }
        }
      `}</style>
      <div className="mb-10 no-print">
        <h1 className="text-2xl font-black font-heading text-slate-900">My Certificates</h1>
        <p className="text-slate-500 mt-1">Official credentials earned from LocalDev Connect projects.</p>
      </div>

      <div className="space-y-10">

        {/* ── Sample / Preview Certificate ── */}
        <div className={downloading === 'sample' ? 'selected-for-print' : ''}>
          <div className="flex items-center gap-3 mb-4 no-print">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest border border-amber-200">
              Sample Certificate
            </span>
            <p className="text-xs text-slate-500">Preview of how your official certificate will look once you complete a project.</p>
          </div>

          <div className={`aspect-[1.414/1] w-full rounded-2xl overflow-hidden shadow-[0_60px_120px_-20px_rgba(201,162,39,0.15)] ring-4 ring-yellow-400/30`}>
            <CertificateCard
              name={studentName}
              projectTitle="Sample Project Completion"
              clientName="LocalDev Connect Platform"
              date={new Date().toISOString()}
              certNumber={`LDC-SAMPLE-${new Date().getFullYear()}`}
              studentDetail={user?.profile || {}}
              isPreview
            />
          </div>

          <div className="mt-4 flex items-center gap-3 no-print">
            <button
              onClick={() => handlePrint('sample')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md"
            >
              <Download className="w-4 h-4" /> Print / Download
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-4 h-4 text-green-600" />
              ISO Certified &amp; Govt. of Telangana Approved
            </div>
          </div>
        </div>

        {/* ── Real Earned Certificates ── */}
        {certificates.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6 no-print">
              <Award className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-black text-slate-900">Earned Certificates ({certificates.length})</h2>
            </div>
            <div className="grid md:grid-cols-1 gap-12">
              {certificates.map(cert => (
                <div key={cert._id} className={downloading === cert._id ? 'selected-for-print' : ''}>
                  <div className="aspect-[1.414/1] w-full rounded-2xl overflow-hidden shadow-[0_60px_120px_-20px_rgba(79,70,229,0.15)] ring-4 ring-indigo-400/20 mb-4">
                    <CertificateCard
                      name={cert.studentId?.name || studentName}
                      projectTitle={cert.projectId?.title || 'Project Completion'}
                      clientName={cert.clientId?.name || 'Local Business'}
                      date={cert.issueDate}
                      certNumber={cert.certificateNumber}
                      studentDetail={user?.profile || {}}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePrint(cert._id)}
                      disabled={downloading === cert._id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md disabled:opacity-50"
                    >
                      {downloading === cert._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Download PDF
                    </button>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      Issued: {new Date(cert.issueDate).toLocaleDateString()}
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{cert.certificateNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* If no earned certs, show explanation */}
        {certificates.length === 0 && (
          <div className="bg-gradient-to-br from-indigo-50 to-slate-100 border border-indigo-100 rounded-2xl p-8 flex gap-6 items-start no-print">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 mb-1">How to Earn Real Certificates</h3>
              <ol className="text-sm text-slate-600 space-y-1 list-decimal ml-4">
                <li>Apply to an open project in your Overview dashboard.</li>
                <li>Get hired by a client and deliver the work.</li>
                <li>Once the client marks the project complete &amp; releases payment, a certificate is automatically generated for you.</li>
              </ol>
              <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-green-500" />
                All certificates are ISO certified and Government of Telangana approved.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Certificates;
